# Bước 1: Build (Biên dịch mã nguồn)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copy file cấu hình maven và pom.xml vào trước
COPY pom.xml .
COPY mvnw .
COPY .mvn ./.mvn
# Tải tất cả các thư viện cần thiết (giúp cache lại nếu thư viện không đổi)
RUN ./mvnw dependency:go-offline -B
# Copy toàn bộ mã nguồn
COPY src ./src
# Biên dịch đóng gói thành file .jar
RUN ./mvnw clean package -DskipTests

# Bước 2: Run (Chạy ứng dụng với JRE nhẹ)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Lấy file .jar từ Bước 1 sang
COPY --from=build /app/target/*.jar app.jar
# Mở cổng mặc định của Spring Boot
EXPOSE 8080
# Lệnh chạy app
ENTRYPOINT ["java", "-jar", "app.jar"]
