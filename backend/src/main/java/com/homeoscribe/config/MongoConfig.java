package com.homeoscribe.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class MongoConfig {

    @Value("${spring.data.mongodb.pool.max-size:50}")
    private int maxSize;

    @Value("${spring.data.mongodb.pool.min-size:5}")
    private int minSize;

    @Value("${spring.data.mongodb.pool.max-wait-time-ms:5000}")
    private long maxWaitTimeMs;

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoClientSettingsBuilderCustomizer() {
        return builder -> builder.applyToConnectionPoolSettings(settings -> 
            settings.maxSize(maxSize)
                    .minSize(minSize)
                    .maxWaitTime(maxWaitTimeMs, TimeUnit.MILLISECONDS)
        );
    }
}
