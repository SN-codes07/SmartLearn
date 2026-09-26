package com.hackstreak.learning_platform.config;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class DotenvLoader {

    private static String detectedSource = "NOT CONFIGURED";
    private static boolean loaded = false;

    /**
     * Scans and loads .env and local.properties files into System properties before Spring starts.
     */
    public static synchronized void load() {
        if (loaded) return;

        List<File> candidateFiles = new ArrayList<>();
        candidateFiles.add(new File("backend/.env"));
        candidateFiles.add(new File(".env"));
        candidateFiles.add(new File("../backend/.env"));
        candidateFiles.add(new File("backend/local.properties"));
        candidateFiles.add(new File("local.properties"));

        for (File file : candidateFiles) {
            if (file.exists() && file.isFile() && file.canRead()) {
                parseAndApply(file);
            }
        }

        // Determine active source description
        determineSource();
        loaded = true;
    }

    private static void parseAndApply(File file) {
        try (BufferedReader reader = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int eqIdx = line.indexOf('=');
                if (eqIdx > 0) {
                    String key = line.substring(0, eqIdx).trim();
                    String val = line.substring(eqIdx + 1).trim();

                    // Strip surrounding quotes
                    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                        if (val.length() >= 2) {
                            val = val.substring(1, val.length() - 1).trim();
                        }
                    }

                    if (!val.isEmpty()) {
                        // Apply for standard variations
                        if (key.equalsIgnoreCase("AI_API_KEY") || key.equalsIgnoreCase("GEMINI_API_KEY") || key.equalsIgnoreCase("ai.api.key")) {
                            if (System.getProperty("AI_API_KEY") == null) {
                                System.setProperty("AI_API_KEY", val);
                            }
                            if (System.getProperty("ai.api.key") == null) {
                                System.setProperty("ai.api.key", val);
                            }
                            if (System.getProperty("GEMINI_API_KEY") == null) {
                                System.setProperty("GEMINI_API_KEY", val);
                            }
                            detectedSource = "FILE (" + file.getPath() + ")";
                        } else {
                            if (System.getProperty(key) == null) {
                                System.setProperty(key, val);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("[DotenvLoader] Warning: Could not read file " + file.getPath() + ": " + e.getMessage());
        }
    }

    private static void determineSource() {
        String envKey = System.getenv("AI_API_KEY");
        if (isValidKey(envKey)) {
            detectedSource = "ENVIRONMENT VARIABLE (AI_API_KEY)";
            return;
        }

        String geminiEnv = System.getenv("GEMINI_API_KEY");
        if (isValidKey(geminiEnv)) {
            detectedSource = "ENVIRONMENT VARIABLE (GEMINI_API_KEY)";
            return;
        }

        String sysProp = System.getProperty("AI_API_KEY");
        if (isValidKey(sysProp)) {
            if (detectedSource == null || detectedSource.equals("NOT CONFIGURED")) {
                detectedSource = "SYSTEM PROPERTY (-DAI_API_KEY)";
            }
            return;
        }

        String aiProp = System.getProperty("ai.api.key");
        if (isValidKey(aiProp)) {
            if (detectedSource == null || detectedSource.equals("NOT CONFIGURED")) {
                detectedSource = "SYSTEM PROPERTY (-Dai.api.key)";
            }
            return;
        }

        // Live check if file exists
        String fileKey = findKeyInFiles();
        if (isValidKey(fileKey)) {
            return; // detectedSource already set in findKeyInFiles
        }

        detectedSource = "NOT CONFIGURED";
    }

    public static String getResolvedApiKey() {
        // 1. Environment Variable
        String env = System.getenv("AI_API_KEY");
        if (isValidKey(env)) return env.trim();

        String geminiEnv = System.getenv("GEMINI_API_KEY");
        if (isValidKey(geminiEnv)) return geminiEnv.trim();

        // 2. System Property
        String sysProp = System.getProperty("AI_API_KEY");
        if (isValidKey(sysProp)) return sysProp.trim();

        String aiProp = System.getProperty("ai.api.key");
        if (isValidKey(aiProp)) return aiProp.trim();

        String geminiSys = System.getProperty("GEMINI_API_KEY");
        if (isValidKey(geminiSys)) return geminiSys.trim();

        // 3. Direct disk read
        return findKeyInFiles();
    }

    public static String findKeyInFiles() {
        File[] candidates = new File[] {
            new File("backend/.env"),
            new File(".env"),
            new File("../backend/.env"),
            new File("backend/local.properties"),
            new File("local.properties")
        };

        for (File file : candidates) {
            if (file.exists() && file.isFile() && file.canRead()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int eq = line.indexOf('=');
                        if (eq > 0) {
                            String k = line.substring(0, eq).trim();
                            String v = line.substring(eq + 1).trim();
                            if ((v.startsWith("\"") && v.endsWith("\"")) || (v.startsWith("'") && v.endsWith("'"))) {
                                if (v.length() >= 2) v = v.substring(1, v.length() - 1).trim();
                            }
                            if (k.equalsIgnoreCase("AI_API_KEY") || k.equalsIgnoreCase("GEMINI_API_KEY") || k.equalsIgnoreCase("ai.api.key")) {
                                if (isValidKey(v)) {
                                    detectedSource = "FILE (" + file.getPath() + ")";
                                    return v;
                                }
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    public static boolean isConfigured() {
        return getResolvedApiKey() != null;
    }

    public static String getSourceDescription() {
        determineSource();
        return detectedSource;
    }

    private static boolean isValidKey(String key) {
        if (key == null) return false;
        String trimmed = key.trim();
        if (trimmed.isEmpty()) return false;
        if (trimmed.equalsIgnoreCase("YOUR_API_KEY")) return false;
        if (trimmed.equalsIgnoreCase("YOUR_GEMINI_API_KEY")) return false;
        if (trimmed.toLowerCase().startsWith("your_")) return false;
        return trimmed.length() >= 10;
    }
}
