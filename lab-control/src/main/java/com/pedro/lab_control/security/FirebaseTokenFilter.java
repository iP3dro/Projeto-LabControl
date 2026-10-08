package com.pedro.lab_control.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseTokenFilter.class);
    private static final String PERFIL_PADRAO = "ADMIN";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token);

                String perfil = extrairPerfil(decodedToken);
                List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + perfil));

                UsuarioAutenticado usuario = new UsuarioAutenticado(decodedToken.getUid(), decodedToken.getEmail());
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(usuario, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
                logger.info("Usuário autenticado: {} ({})", decodedToken.getEmail(), perfil);

            } catch (Exception e) {
                logger.error("Falha ao validar o token do Firebase: {}", e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extrairPerfil(FirebaseToken decodedToken) {
        Object perfil = decodedToken.getClaims().get("perfil");
        if (perfil instanceof String valor && !valor.isBlank()) {
            return valor.toUpperCase();
        }
        return PERFIL_PADRAO;
    }
}
