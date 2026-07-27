package com.homeoscribe;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableMongoAuditing
@EnableScheduling
public class HomeoscribeApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(HomeoscribeApplication.class);
        app.setBannerMode(Banner.Mode.OFF); // suppress default Spring Boot banner
        app.run(args);
    }
}
