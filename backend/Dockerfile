# ════════════════════════════════════════════════════════════════
# Lean Dockerfile — single stage cho phase đầu
# Hardening (multi-stage, non-root, ZGC, healthcheck) sẽ thêm ở giai đoạn deploy production
# ════════════════════════════════════════════════════════════════

FROM eclipse-temurin:25-jre-alpine

WORKDIR /app
COPY target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
