package com.supermarket.security;

import java.util.List;
import java.util.ArrayList;

import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.supermarket.user.entity.User;
import com.supermarket.user.repository.UserRepository;
import com.supermarket.permission.repository.PermissionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;
	private final PermissionRepository permissionRepository;

	@Override
	public UserDetails loadUserByUsername(String username) {
		User user = userRepository.findByEmailWithRole(username.trim().toLowerCase())
				.orElseThrow(() -> new UsernameNotFoundException("User not found"));
		if (!Boolean.TRUE.equals(user.getIsActive())) {
			throw new DisabledException("User is inactive");
		}
		List<SimpleGrantedAuthority> authorities = new ArrayList<>();
		authorities.add(new SimpleGrantedAuthority(RoleNames.toAuthority(user.getRole().getName())));
		permissionRepository.findCodesByRoleId(user.getRole().getId()).stream()
				.map(SimpleGrantedAuthority::new)
				.forEach(authorities::add);
		return new LoggedUser(user.getId(), user.getEmail(), user.getPassword(), true, authorities);
	}
}
