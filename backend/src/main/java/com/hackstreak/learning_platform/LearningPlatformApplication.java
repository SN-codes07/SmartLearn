package com.hackstreak.learning_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LearningPlatformApplication {

	public static void main(String[] args) {
		com.hackstreak.learning_platform.config.DotenvLoader.load();
		SpringApplication.run(LearningPlatformApplication.class, args);
	}

}
