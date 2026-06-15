package com.supermarket.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.Getter;

@Getter
public class LoggedUser implements UserDetails {

	private final Long id;
	private final String email;
	private final String password;
	private final boolean active;
	private final Collection<? extends GrantedAuthority> authorities;

	public LoggedUser(Long id, String email, String password, boolean active,
			Collection<? extends GrantedAuthority> authorities) {
		this.id = id;
		this.email = email;
		this.password = password != null ? password : "";
		this.active = active;
		this.authorities = authorities;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return email;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return active;
	}
}
