// src/main/java/com/quanlynhankhau/api/util/JwtUtil.java
package com.quanlynhankhau.api.util;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.time.Instant;
import java.time.ZoneId;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;

@Component
public class JwtUtil {

    // Đoạn mã bí mật để ký JWT. Trong thực tế, nên lấy từ file config.
    // Phải đủ dài để an toàn với thuật toán HS256.
    private final String SECRET_KEY = "day_la_mot_chuoi_bi_mat_rat_dai_de_ma_hoa_jwt_token";
    
    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    
    // Múi giờ Việt Nam
    private static final ZoneId VIETNAM_TIMEZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    // Trích xuất username từ token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Trích xuất ngày hết hạn từ token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Hàm chung để trích xuất một claim từ token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Lấy tất cả thông tin (claims) từ token
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }

    // Kiểm tra xem token đã hết hạn chưa
    private Boolean isTokenExpired(String token) {
        Date expirationDate = extractExpiration(token);
        Date currentDate = Date.from(Instant.now().atZone(VIETNAM_TIMEZONE).toInstant());
        return expirationDate.before(currentDate);
    }

    // Tạo token mới cho người dùng
    public String generateToken(UserDetails userDetails) {
        // Tạo một Map để chứa các custom claims
        Map<String, Object> claims = new HashMap<>();
        
        // Lấy role đầu tiên từ danh sách authorities và thêm vào claims
        // Giả sử mỗi user chỉ có 1 role
        if (!userDetails.getAuthorities().isEmpty()) {
            claims.put("role", userDetails.getAuthorities().iterator().next().getAuthority());
        }

        // Sử dụng thời gian Việt Nam để tạo token
        Instant now = Instant.now().atZone(VIETNAM_TIMEZONE).toInstant();
        Date issuedAt = Date.from(now);
        Date expiration = Date.from(now.plusSeconds(10 * 60 * 60)); // Hết hạn sau 10 giờ
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(issuedAt)
                .setExpiration(expiration)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Xác thực token (kiểm tra username và ngày hết hạn)
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
    
    // Tạo refresh token với thời gian hết hạn dài hơn (30 ngày)
    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        
        // Lấy role đầu tiên từ danh sách authorities và thêm vào claims
        if (!userDetails.getAuthorities().isEmpty()) {
            claims.put("role", userDetails.getAuthorities().iterator().next().getAuthority());
        }
        
        // Đánh dấu đây là refresh token
        claims.put("type", "refresh");

        // Sử dụng thời gian Việt Nam để tạo token
        Instant now = Instant.now().atZone(VIETNAM_TIMEZONE).toInstant();
        Date issuedAt = Date.from(now);
        Date expiration = Date.from(now.plusSeconds(30 * 24 * 60 * 60)); // Hết hạn sau 30 ngày
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(issuedAt)
                .setExpiration(expiration)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    
    // Kiểm tra xem token có phải là refresh token không
    public Boolean isRefreshToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "refresh".equals(claims.get("type"));
        } catch (Exception e) {
            return false;
        }
    }
    
    // Tạo cặp access token và refresh token
    public Map<String, String> generateTokenPair(UserDetails userDetails) {
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", generateToken(userDetails));
        tokens.put("refreshToken", generateRefreshToken(userDetails));
        return tokens;
    }
    
    // Xác thực refresh token
    public Boolean validateRefreshToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && 
                   !isTokenExpired(token) && 
                   isRefreshToken(token));
        } catch (Exception e) {
            return false;
        }
    }
}