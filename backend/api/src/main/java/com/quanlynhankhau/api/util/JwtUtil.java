// src/main/java/com/quanlynhankhau/api/util/JwtUtil.java
package com.quanlynhankhau.api.util;

import java.util.Date;
import java.util.function.Function;

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
        return extractExpiration(token).before(new Date());
    }

    // Tạo token mới cho người dùng
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // Hết hạn sau 10 giờ
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Xác thực token (kiểm tra username và ngày hết hạn)
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}