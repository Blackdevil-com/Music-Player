package com.scorpix.music_player;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
public class MusicPlayerApplication {

	public static void main(String[] args) {
		loadEnvFile();
		SpringApplication.run(MusicPlayerApplication.class, args);
	}

	/**
	 * Automatically discovers and loads environment variables from .env file
	 * into System properties before Spring Boot context initialization.
	 */
	private static void loadEnvFile() {
		Path[] candidatePaths = new Path[] {
			Paths.get(".env"),
			Paths.get("../.env"),
			Paths.get("backend/.env")
		};

		for (Path path : candidatePaths) {
			if (Files.exists(path) && !Files.isDirectory(path)) {
				try (BufferedReader reader = Files.newBufferedReader(path)) {
					String line;
					while ((line = reader.readLine()) != null) {
						line = line.trim();
						if (line.isEmpty() || line.startsWith("#")) {
							continue;
						}
						int equalsIdx = line.indexOf('=');
						if (equalsIdx > 0) {
							String key = line.substring(0, equalsIdx).trim();
							String value = line.substring(equalsIdx + 1).trim();
							// Strip optional quotes
							if ((value.startsWith("\"") && value.endsWith("\"")) ||
							    (value.startsWith("'") && value.endsWith("'"))) {
								value = value.substring(1, value.length() - 1);
							}
							if (System.getProperty(key) == null && System.getenv(key) == null) {
								System.setProperty(key, value);
							}
						}
					}
					System.out.println("[Patta Kelu] Loaded environment configuration from: " + path.toAbsolutePath());
					break;
				} catch (Exception e) {
					System.err.println("[Patta Kelu] Warning: Could not read .env from " + path + ": " + e.getMessage());
				}
			}
		}
	}

}
