package com.hackstreak.learning_platform.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class AiStartupChecker {

    private static final Logger logger = LoggerFactory.getLogger(AiStartupChecker.class);

    @Value("${ai.gemini.model:gemini-2.5-flash}")
    private String primaryModel;

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        boolean configured = DotenvLoader.isConfigured();
        String source = DotenvLoader.getSourceDescription();

        System.out.println("\n" +
            "============================================================\n" +
            "           SMARTLEARN AI TUTOR CONFIGURATION CHECK          \n" +
            "============================================================\n" +
            " Gemini AI Configured : " + (configured ? "TRUE" : "FALSE") + "\n" +
            " Configuration Source : " + source + "\n" +
            " Primary Model        : " + primaryModel + "\n" +
            " Fallback Models      : gemini-3.6-flash, gemini-3.8-flash, gemini-flash-latest\n" +
            " Status               : " + (configured ? "READY FOR AI TUTOR CHATS" : "AWAITING KEY (Set AI_API_KEY in backend/.env or environment)") + "\n" +
            "============================================================\n");

        if (configured) {
            logger.info("SmartLearn AI Tutor is fully configured via {}", source);
        } else {
            logger.warn("SmartLearn AI Tutor is NOT configured. Set AI_API_KEY in backend/.env or export AI_API_KEY in your terminal.");
        }
    }
}
