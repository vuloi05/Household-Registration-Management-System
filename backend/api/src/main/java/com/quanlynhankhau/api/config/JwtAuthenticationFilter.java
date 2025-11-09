// src/main/java/com/quanlynhankhau/api/config/JwtAuthenticationFilter.java
package com.quanlynhankhau.api.config;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.quanlynhankhau.api.service.CustomUserDetailsService;
import com.quanlynhankhau.api.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal( @NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        // Lấy token từ header
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                // Token đã expired hoặc không hợp lệ, bỏ qua và tiếp tục
                logger.debug("JWT token expired or invalid: " + e.getMessage());
            }
        }

        // Nếu đã có username và chưa có phiên xác thực nào trong context
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                // Nếu token hợp lệ, tạo phiên xác thực và đặt vào context
                if (jwtUtil.validateToken(jwt, userDetails)) {
                    // Log để debug
                    logger.info("Authentication successful for user: " + username);
                    logger.info("User authorities: " + userDetails.getAuthorities());
                    
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken
                            .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                } else {
                    logger.warn("Token validation failed for user: " + username);
                }
            } catch (Exception e) {
                // User không tồn tại trong database, log và tiếp tục (sẽ bị reject ở authorization layer)
                logger.error("Error during authentication for user: " + username + " - " + e.getMessage(), e);
                // Không set authentication, request sẽ bị reject với 403
            }
        } else if (username == null) {
            logger.warn("No username extracted from token for request: " + request.getRequestURI());
        }
        
        // Tiếp tục chuỗi filter
        filterChain.doFilter(request, response);
    }
}