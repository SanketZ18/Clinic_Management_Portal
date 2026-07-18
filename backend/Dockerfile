# Stage 1: Build the application
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies to cache them
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the package
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/homeoscribe-backend-1.0.0.jar app.jar

# Expose port 8090
EXPOSE 8090

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
