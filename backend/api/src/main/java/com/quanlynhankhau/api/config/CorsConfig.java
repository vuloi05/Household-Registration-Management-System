package com.quanlynhankhau.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Cho phép tất cả origins (trong development)
        // Trong production, nên chỉ định cụ thể các origins được phép
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        
        // Cho phép tất cả các HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Cho phép tất cả các headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Cho phép gửi credentials (cookies, authorization headers)
        // Lưu ý: khi dùng setAllowedOriginPatterns("*"), không cần setAllowCredentials(true)
        // configuration.setAllowCredentials(true);
        
        // Expose headers mà client có thể đọc được
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        // Cache preflight request trong 1 giờ
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}

