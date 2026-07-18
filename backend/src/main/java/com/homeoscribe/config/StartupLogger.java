package com.homeoscribe.config;

import com.mongodb.client.MongoClient;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StartupLogger {

    private final MongoClient mongoClient;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        boolean mongoOk;
        try {
            mongoClient.listDatabaseNames().first();
            mongoOk = true;
        } catch (Exception e) {
            mongoOk = false;
        }

        System.out.println();
        System.out.println("Backend is running successfully");
        if (mongoOk) {
            System.out.println("MongoDB Connected");
        } else {
            System.out.println("MongoDB Connection FAILED — check application.yml URI");
        }
        System.out.println();
    }
}
