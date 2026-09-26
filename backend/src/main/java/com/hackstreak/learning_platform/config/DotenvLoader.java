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

        // Automatically resolve Railway dynamic PORT and MySQL database URLs/environment variables
        configureCloudEnvironment();
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

    public static void configureCloudEnvironment() {
        // 1. Dynamic Port Binding for Railway / Heroku / Cloud platforms
        String portEnv = getEnvOrProp("PORT");
        if (portEnv != null && !portEnv.isEmpty()) {
            System.setProperty("server.port", portEnv);
            System.setProperty("PORT", portEnv);
        }

        String resolvedHost = null;
        String resolvedPort = null;
        String resolvedDatabase = null;
        String resolvedUsername = null;
        String resolvedPassword = null;
        String resolvedSource = null;
        boolean requireSsl = false;

        // 2. PRIORITY 1: Prefer Railway's standard individual MySQL connection variables
        // (MYSQLHOST, MYSQLPORT, MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD) or alternatives
        String host = getEnvOrProp("MYSQLHOST");
        if (host == null) host = getEnvOrProp("MYSQL_HOST");
        if (host == null) host = getEnvOrProp("DB_HOST");

        if (host != null && !host.isEmpty() && !host.equalsIgnoreCase("localhost") && !host.equals("127.0.0.1")) {
            resolvedHost = host;

            String p = getEnvOrProp("MYSQLPORT");
            if (p == null) p = getEnvOrProp("MYSQL_PORT");
            if (p == null) p = getEnvOrProp("DB_PORT");
            resolvedPort = (p != null && !p.isEmpty()) ? p : "3306";

            String db = getEnvOrProp("MYSQLDATABASE");
            if (db == null) db = getEnvOrProp("MYSQL_DATABASE");
            if (db == null) db = getEnvOrProp("DB_NAME");
            resolvedDatabase = (db != null && !db.isEmpty()) ? db : "learning_platform_db";

            String u = getEnvOrProp("MYSQLUSER");
            if (u == null) u = getEnvOrProp("MYSQL_USER");
            if (u == null) u = getEnvOrProp("DB_USER");
            resolvedUsername = (u != null && !u.isEmpty()) ? u : "root";

            String pwd = getEnvOrProp("MYSQLPASSWORD");
            if (pwd == null) pwd = getEnvOrProp("MYSQL_PASSWORD");
            if (pwd == null) pwd = getEnvOrProp("DB_PASSWORD");
            resolvedPassword = pwd != null ? pwd : "";

            resolvedSource = "Railway / Cloud Environment Variables (MYSQLHOST, MYSQLPORT, etc.)";
        }

        // 3. PRIORITY 2: Railway / Standard MySQL Connection URL (handles mysql://, mysqls://, jdbc:mysql://)
        if (resolvedHost == null) {
            String dbUrl = getEnvOrProp("MYSQL_URL");
            if (dbUrl == null) dbUrl = getEnvOrProp("DATABASE_URL");
            if (dbUrl == null) dbUrl = getEnvOrProp("MYSQL_PUBLIC_URL");
            if (dbUrl == null) dbUrl = getEnvOrProp("MYSQL_PRIVATE_URL");
            if (dbUrl == null) dbUrl = getEnvOrProp("DATABASE_PUBLIC_URL");
            if (dbUrl == null) dbUrl = getEnvOrProp("DATABASE_PRIVATE_URL");
            if (dbUrl == null) dbUrl = getEnvOrProp("SPRING_DATASOURCE_URL");

            if (dbUrl != null && !dbUrl.isEmpty()) {
                if (dbUrl.startsWith("jdbc:mysql://")) {
                    String rest = dbUrl.substring("jdbc:mysql://".length());
                    int slashIdx = rest.indexOf('/');
                    if (slashIdx != -1) {
                        String hostPort = rest.substring(0, slashIdx);
                        String dbAndParams = rest.substring(slashIdx + 1);
                        int colonIdx = hostPort.lastIndexOf(':');
                        if (colonIdx != -1) {
                            resolvedHost = hostPort.substring(0, colonIdx);
                            resolvedPort = hostPort.substring(colonIdx + 1);
                        } else {
                            resolvedHost = hostPort;
                            resolvedPort = "3306";
                        }
                        int qIdx = dbAndParams.indexOf('?');
                        resolvedDatabase = qIdx != -1 ? dbAndParams.substring(0, qIdx) : dbAndParams;
                    }
                    resolvedUsername = getEnvOrProp("MYSQLUSER");
                    if (resolvedUsername == null) resolvedUsername = getEnvOrProp("DB_USER");
                    if (resolvedUsername == null) resolvedUsername = "root";

                    resolvedPassword = getEnvOrProp("MYSQLPASSWORD");
                    if (resolvedPassword == null) resolvedPassword = getEnvOrProp("DB_PASSWORD");
                    if (resolvedPassword == null) resolvedPassword = "";

                    resolvedSource = "Direct jdbc:mysql URL";
                } else if (dbUrl.contains("://")) {
                    try {
                        int protoIdx = dbUrl.indexOf("://");
                        String rest = dbUrl.substring(protoIdx + 3);

                        int lastAt = rest.lastIndexOf('@');
                        String userInfo = null;
                        String hostPortPath = rest;
                        if (lastAt != -1) {
                            userInfo = rest.substring(0, lastAt);
                            hostPortPath = rest.substring(lastAt + 1);
                        }

                        String u = "root";
                        String pass = "";
                        if (userInfo != null && !userInfo.isEmpty()) {
                            int firstColon = userInfo.indexOf(':');
                            if (firstColon != -1) {
                                u = userInfo.substring(0, firstColon);
                                pass = userInfo.substring(firstColon + 1);
                            } else {
                                u = userInfo;
                            }
                            try {
                                u = java.net.URLDecoder.decode(u, StandardCharsets.UTF_8);
                                pass = java.net.URLDecoder.decode(pass, StandardCharsets.UTF_8);
                            } catch (Exception ignored) {}
                        }

                        int slashIdx = hostPortPath.indexOf('/');
                        String hostPort = slashIdx != -1 ? hostPortPath.substring(0, slashIdx) : hostPortPath;
                        String dbAndParams = slashIdx != -1 ? hostPortPath.substring(slashIdx + 1) : "learning_platform_db";

                        String h = hostPort;
                        String pt = "3306";
                        int colonIdx = hostPort.lastIndexOf(':');
                        if (colonIdx != -1) {
                            h = hostPort.substring(0, colonIdx);
                            pt = hostPort.substring(colonIdx + 1);
                        }

                        String d = dbAndParams;
                        int qIdx = dbAndParams.indexOf('?');
                        if (qIdx != -1) {
                            d = dbAndParams.substring(0, qIdx);
                        }
                        if (d == null || d.trim().isEmpty()) {
                            d = "learning_platform_db";
                        }

                        // Supplement or override from explicit user/password variables if set
                        String envUser = getEnvOrProp("MYSQLUSER");
                        if (envUser != null && !envUser.isEmpty()) u = envUser;
                        String envPass = getEnvOrProp("MYSQLPASSWORD");
                        if (envPass != null && !envPass.isEmpty()) pass = envPass;

                        resolvedHost = h;
                        resolvedPort = pt;
                        resolvedDatabase = d;
                        resolvedUsername = u;
                        resolvedPassword = pass;
                        resolvedSource = "Railway / Cloud URL (" + dbUrl.substring(0, protoIdx) + "://)";
                    } catch (Exception e) {
                        System.err.println("[DotenvLoader] Warning: Could not parse database URL: " + e.getMessage());
                    }
                }

                if (dbUrl.contains("sslMode=REQUIRED") || dbUrl.contains("ssl-mode=REQUIRED")) {
                    requireSsl = true;
                }
            }
        }

        // 4. PRIORITY 3: Local / Development Fallback
        if (resolvedHost == null) {
            String localHost = getEnvOrProp("DB_HOST");
            resolvedHost = (localHost != null && !localHost.isEmpty()) ? localHost : "localhost";

            String localPort = getEnvOrProp("DB_PORT");
            resolvedPort = (localPort != null && !localPort.isEmpty()) ? localPort : "3306";

            String localDb = getEnvOrProp("DB_NAME");
            resolvedDatabase = (localDb != null && !localDb.isEmpty()) ? localDb : "learning_platform_db";

            String localUser = getEnvOrProp("DB_USER");
            resolvedUsername = (localUser != null && !localUser.isEmpty()) ? localUser : "root";

            String localPass = getEnvOrProp("DB_PASSWORD");
            resolvedPassword = localPass != null ? localPass : "hackathon123";

            resolvedSource = "Localhost Default Fallback";
        }

        // 5. Construct safe, fully-formed JDBC connection URL
        String sslParam = requireSsl ? "sslMode=REQUIRED" : "useSSL=false";
        String jdbcUrl = "jdbc:mysql://" + resolvedHost + ":" + resolvedPort + "/" + resolvedDatabase
                + "?createDatabaseIfNotExist=true&allowPublicKeyRetrieval=true&" + sslParam + "&serverTimezone=UTC";

        // 6. Set Java System properties for Spring Boot DataSource
        System.setProperty("spring.datasource.url", jdbcUrl);
        System.setProperty("SPRING_DATASOURCE_URL", jdbcUrl);

        System.setProperty("spring.datasource.username", resolvedUsername);
        System.setProperty("SPRING_DATASOURCE_USERNAME", resolvedUsername);

        System.setProperty("spring.datasource.password", resolvedPassword != null ? resolvedPassword : "");
        System.setProperty("SPRING_DATASOURCE_PASSWORD", resolvedPassword != null ? resolvedPassword : "");

        System.setProperty("spring.datasource.driver-class-name", "com.mysql.cj.jdbc.Driver");
        System.setProperty("SPRING_DATASOURCE_DRIVER_CLASS_NAME", "com.mysql.cj.jdbc.Driver");

        // 7. Safe diagnostic logging (ONLY host, port, database, username, and boolean password existence)
        System.out.println("==================================================");
        System.out.println("[DatabaseConfig] Database Configuration Diagnostics:");
        System.out.println("[DatabaseConfig] Source: " + resolvedSource);
        System.out.println("[DatabaseConfig] Host: " + resolvedHost);
        System.out.println("[DatabaseConfig] Port: " + resolvedPort);
        System.out.println("[DatabaseConfig] Database: " + resolvedDatabase);
        System.out.println("[DatabaseConfig] Username: " + resolvedUsername);
        System.out.println("[DatabaseConfig] Password configured: " + (resolvedPassword != null && !resolvedPassword.isEmpty()));
        System.out.println("==================================================");
    }

    private static String getEnvOrProp(String name) {
        String val = System.getenv(name);
        if (val == null || val.trim().isEmpty()) {
            val = System.getProperty(name);
        }
        if (val != null) {
            val = stripQuotes(val.trim());
            if (val.isEmpty()) return null;
        }
        return val;
    }

    private static String stripQuotes(String s) {
        if (s == null) return null;
        String res = s.trim();
        if ((res.startsWith("\"") && res.endsWith("\"")) || (res.startsWith("'") && res.endsWith("'"))) {
            if (res.length() >= 2) {
                res = res.substring(1, res.length() - 1).trim();
            }
        }
        return res;
    }
}
