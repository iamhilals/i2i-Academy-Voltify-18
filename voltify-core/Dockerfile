FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies for caching layer
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", \
            "--add-opens=jdk.management/com.sun.management.internal=ALL-UNNAMED", \
            "--add-opens=java.base/jdk.internal.misc=ALL-UNNAMED", \
            "--add-opens=java.base/sun.nio.ch=ALL-UNNAMED", \
            "--add-opens=java.management/com.sun.jmx.mbeanserver=ALL-UNNAMED", \
            "--add-opens=jdk.internal.jvmstat/sun.jvmstat.monitor=ALL-UNNAMED", \
            "--add-opens=java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED", \
            "--add-opens=java.base/java.io=ALL-UNNAMED", \
            "--add-opens=java.base/java.nio=ALL-UNNAMED", \
            "--add-opens=java.base/java.util=ALL-UNNAMED", \
            "--add-opens=java.base/java.util.concurrent=ALL-UNNAMED", \
            "--add-opens=java.base/java.util.concurrent.locks=ALL-UNNAMED", \
            "--add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED", \
            "--add-opens=java.base/java.lang=ALL-UNNAMED", \
            "--add-opens=java.base/java.lang.invoke=ALL-UNNAMED", \
            "--add-opens=java.base/java.math=ALL-UNNAMED", \
            "--add-opens=java.sql/java.sql=ALL-UNNAMED", \
            "-jar", "app.jar"]
