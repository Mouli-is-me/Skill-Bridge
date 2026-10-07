/*
  =============================================================================
  SKILL BRIDGE — ESP32 HARDWARE TELEMETRY FIRMWARE
  Machine: M01
  Sensors: MPU6050 (Motion/Vibration), DS18B20 (Temperature), LM393 (Digital Vibration)
  Architecture: Local Processing -> Wi-Fi HTTP POST -> FastAPI Backend
  =============================================================================
  
  SAFETY GUARANTEE:
  If Wi-Fi or backend is unavailable, local sensor sampling, state detection,
  and monitoring CONTINUE running without freezing or blocking!
  =============================================================================
*/

#include <Wire.h>
#include <math.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// =============================================================================
// NETWORKING & DEVICE CONFIGURATION (Modify to match your network)
// =============================================================================
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* BACKEND_URL = "http://192.168.1.100:8000/api/machines/M01/data";

const char* MACHINE_ID = "M01";
const char* DEVICE_ID = "ESP32-M01";
const unsigned long TELEMETRY_INTERVAL_MS = 1000; // Send payload every 1 second

// =============================================================================
// HARDWARE PIN DEFINITIONS
// =============================================================================
const int MPU_ADDR = 0x68;
const int ONE_WIRE_BUS = 4;   // DS18B20 Data Pin (GPIO 4)
const int SW420_PIN = 27;     // LM393 Digital Vibration Sensor (GPIO 27)

// OneWire setup for DS18B20
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature ds18b20(&oneWire);

// MPU6050 Calibration Offsets
const long accelX_offset = 16250;
const long accelY_offset = 421;
const long accelZ_offset = -13873;

// Baseline Calibration & Settings
const int BASELINE_SAMPLES = 200;
const int SAMPLE_DELAY = 10;
const float EVENT_THRESHOLD = 0.03;

// State Thresholds
const float IDLE_RMS_THRESHOLD = 0.02;
const float ACTIVE_RMS_THRESHOLD = 0.05;
const float SEVERE_RMS_THRESHOLD = 0.50;
const float SEVERE_PEAK_THRESHOLD = 1.00;

// Confirmation Windows
const int STARTING_CONFIRM_WINDOWS = 2;
const int RUNNING_CONFIRM_WINDOWS = 3;
const int STOPPING_CONFIRM_WINDOWS = 3;
const int IDLE_CONFIRM_WINDOWS = 3;
const int ABNORMAL_CONFIRM_WINDOWS = 2;

// Machine State Enum
enum MachineState {
  IDLE,
  STARTING,
  RUNNING,
  STOPPING,
  ABNORMAL
};

MachineState currentState = IDLE;

// State confirmation counters
int activeWindows = 0;
int idleWindows = 0;
int stoppingWindows = 0;
int severeWindows = 0;

// Sensor baseline variables
float baselineX = 0;
float baselineY = 0;
float baselineZ = 0;

// Measurement window variables
float currentRms = 0.0;
float currentPeak = 0.0;
int currentEvents = 0;
float currentTempC = 25.0;
String currentDigitalState = "QUIET";
int machineScore = 100;
String machineStatusStr = "NORMAL";

unsigned long lastTelemetryTime = 0;

// Forward declarations
void readAccelerometer(float &x, float &y, float &z);
void calibrateBaseline();
void updateOperatingState(float rms, float peak);
String stateToString(MachineState state);
void sendTelemetryToBackend();
void connectWiFiNonBlocking();

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n=================================");
  Serial.println("SKILL BRIDGE — ESP32 NODE M01");
  Serial.println("=================================");

  // Initialize I2C for MPU6050
  Wire.begin();
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B); // Wake up MPU6050
  Wire.write(0);
  Wire.endTransmission(true);

  // Initialize DS18B20
  ds18b20.begin();

  // Initialize LM393 Digital Input
  pinMode(SW420_PIN, INPUT);

  // Calibrate baseline
  calibrateBaseline();

  // Initialize Wi-Fi
  connectWiFiNonBlocking();
}

void loop() {
  // 1. High-frequency Local Sensor Sampling (MPU6050 RMS & Peak Window)
  float sumSquares = 0;
  float peakVibration = 0;
  int eventCount = 0;
  int windowSamples = 50;

  for (int i = 0; i < windowSamples; i++) {
    float x, y, z;
    readAccelerometer(x, y, z);

    float deltaX = x - baselineX;
    float deltaY = y - baselineY;
    float deltaZ = z - baselineZ;

    float magnitude = sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
    sumSquares += (magnitude * magnitude);

    if (magnitude > peakVibration) {
      peakVibration = magnitude;
    }

    if (magnitude > EVENT_THRESHOLD) {
      eventCount++;
    }

    delay(10); // 10ms sampling interval
  }

  currentRms = sqrt(sumSquares / windowSamples);
  currentPeak = peakVibration;
  currentEvents = eventCount;

  // 2. Read DS18B20 Temperature
  ds18b20.requestTemperatures();
  float tempC = ds18b20.getTempCByIndex(0);
  if (tempC != DEVICE_DISCONNECTED_C && tempC > -50.0) {
    currentTempC = tempC;
  }

  // 3. Read LM393 Digital Vibration Sensor
  int digitalReading = digitalRead(SW420_PIN);
  currentDigitalState = (digitalReading == HIGH) ? "ACTIVE" : "QUIET";

  // 4. Update Local Machine State Engine
  updateOperatingState(currentRms, currentPeak);

  // 5. Calculate Score & Status
  if (currentState == ABNORMAL || currentTempC >= 85.0) {
    machineStatusStr = "ALERT";
    machineScore = 45;
  } else if (currentTempC >= 75.0 || currentRms >= 0.35) {
    machineStatusStr = "DEVIATE";
    machineScore = 78;
  } else if (currentState == IDLE) {
    machineStatusStr = "NORMAL";
    machineScore = 100;
  } else {
    machineStatusStr = "NORMAL";
    machineScore = 95;
  }

  // Debug Serial log
  Serial.printf("[M01] State:%s | Status:%s | Temp:%.1fC | RMS:%.3f | Peak:%.3f | Digital:%s\n",
    stateToString(currentState).c_str(),
    machineStatusStr.c_str(),
    currentTempC,
    currentRms,
    currentPeak,
    currentDigitalState.c_str()
  );

  // 6. Non-blocking Network Telemetry Transmission
  unsigned long now = millis();
  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = now;

    // Check Wi-Fi reconnect if dropped
    if (WiFi.status() != WL_CONNECTED) {
      connectWiFiNonBlocking();
    }

    // Send HTTP POST payload
    sendTelemetryToBackend();
  }
}

// Read MPU6050 Raw & convert to g
void readAccelerometer(float &x, float &y, float &z) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, 6, true);

  int16_t rawX = Wire.read() << 8 | Wire.read();
  int16_t rawY = Wire.read() << 8 | Wire.read();
  int16_t rawZ = Wire.read() << 8 | Wire.read();

  x = (rawX - accelX_offset) / 16384.0;
  y = (rawY - accelY_offset) / 16384.0;
  z = (rawZ - accelZ_offset) / 16384.0;
}

// Baseline Calibration
void calibrateBaseline() {
  float sumX = 0, sumY = 0, sumZ = 0;
  for (int i = 0; i < BASELINE_SAMPLES; i++) {
    float x, y, z;
    readAccelerometer(x, y, z);
    sumX += x; sumY += y; sumZ += z;
    delay(SAMPLE_DELAY);
  }
  baselineX = sumX / BASELINE_SAMPLES;
  baselineY = sumY / BASELINE_SAMPLES;
  baselineZ = sumZ / BASELINE_SAMPLES;
}

// Operating State Engine
void updateOperatingState(float rms, float peak) {
  bool inactive = (rms < IDLE_RMS_THRESHOLD);
  bool active = (rms >= ACTIVE_RMS_THRESHOLD);
  bool severe = (rms >= SEVERE_RMS_THRESHOLD || peak >= SEVERE_PEAK_THRESHOLD);

  if (currentState == IDLE) {
    if (active) {
      activeWindows++;
      if (activeWindows >= STARTING_CONFIRM_WINDOWS) {
        currentState = STARTING;
        activeWindows = 0;
      }
    } else {
      activeWindows = 0;
    }
  } else if (currentState == STARTING) {
    if (inactive) {
      idleWindows++;
      if (idleWindows >= IDLE_CONFIRM_WINDOWS) {
        currentState = IDLE;
        idleWindows = 0;
      }
    } else if (active) {
      activeWindows++;
      if (activeWindows >= RUNNING_CONFIRM_WINDOWS) {
        currentState = RUNNING;
        activeWindows = 0;
      }
    }
  } else if (currentState == RUNNING) {
    if (severe) {
      severeWindows++;
      if (severeWindows >= ABNORMAL_CONFIRM_WINDOWS) {
        currentState = ABNORMAL;
        severeWindows = 0;
      }
    } else {
      severeWindows = 0;
    }

    if (inactive) {
      stoppingWindows++;
      if (stoppingWindows >= STOPPING_CONFIRM_WINDOWS) {
        currentState = STOPPING;
        stoppingWindows = 0;
      }
    } else {
      stoppingWindows = 0;
    }
  } else if (currentState == STOPPING) {
    if (active) {
      activeWindows++;
      if (activeWindows >= RUNNING_CONFIRM_WINDOWS) {
        currentState = RUNNING;
        activeWindows = 0;
      }
    } else {
      idleWindows++;
      if (idleWindows >= IDLE_CONFIRM_WINDOWS) {
        currentState = IDLE;
        idleWindows = 0;
      }
    }
  } else if (currentState == ABNORMAL) {
    if (!severe) {
      currentState = RUNNING;
    }
  }
}

String stateToString(MachineState state) {
  switch (state) {
    case IDLE: return "IDLE";
    case STARTING: return "STARTING";
    case RUNNING: return "RUNNING";
    case STOPPING: return "STOPPING";
    case ABNORMAL: return "ABNORMAL";
    default: return "IDLE";
  }
}

// Connect to Wi-Fi non-blocking
void connectWiFiNonBlocking() {
  if (WiFi.status() == WL_CONNECTED) return;

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("[WiFi] Connecting to ");
  Serial.println(WIFI_SSID);
}

// Send JSON telemetry to FastAPI backend
void sendTelemetryToBackend() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[SkillBridge] Wi-Fi unavailable — Skipping HTTP post (Local monitoring OK)");
    return;
  }

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.setTimeout(800); // 800ms non-blocking HTTP timeout
  http.addHeader("Content-Type", "application/json");

  // Construct JSON payload
  char jsonBuf[512];
  snprintf(jsonBuf, sizeof(jsonBuf),
    "{"
      "\"machine_id\":\"%s\","
      "\"device_id\":\"%s\","
      "\"timestamp\":%lu,"
      "\"machine\":{\"state\":\"%s\",\"score\":%d,\"status\":\"%s\"},"
      "\"mpu6050\":{\"rms\":%.4f,\"peak\":%.4f,\"events\":%d},"
      "\"ds18b20\":{\"temperature\":%.1f},"
      "\"digital_vibration\":{\"state\":\"%s\"}"
    "}",
    MACHINE_ID,
    DEVICE_ID,
    millis() / 1000,
    stateToString(currentState).c_str(),
    machineScore,
    machineStatusStr.c_str(),
    currentRms,
    currentPeak,
    currentEvents,
    currentTempC,
    currentDigitalState.c_str()
  );

  int httpCode = http.POST(jsonBuf);
  if (httpCode > 0) {
    Serial.printf("[SkillBridge] Server HTTP %d OK\n", httpCode);
  } else {
    Serial.printf("[SkillBridge] HTTP POST Failed: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}
