package com.supermarket.user.util;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public final class PasswordGenerator {

	private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
	private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	private static final String DIGITS = "0123456789";
	private static final String SPECIAL = "!@*-_";
	private static final String ALL = LOWER + UPPER + DIGITS + SPECIAL;
	private static final SecureRandom RANDOM = new SecureRandom();

	private PasswordGenerator() {
	}

	public static String generate(int length) {
		if (length < 8) {
			throw new IllegalArgumentException("Password length must be at least 8 characters");
		}

		List<Character> chars = new ArrayList<>();
		chars.add(LOWER.charAt(RANDOM.nextInt(LOWER.length())));
		chars.add(UPPER.charAt(RANDOM.nextInt(UPPER.length())));
		chars.add(DIGITS.charAt(RANDOM.nextInt(DIGITS.length())));
		chars.add(SPECIAL.charAt(RANDOM.nextInt(SPECIAL.length())));

		for (int i = 4; i < length; i++) {
			chars.add(ALL.charAt(RANDOM.nextInt(ALL.length())));
		}

		Collections.shuffle(chars, RANDOM);

		StringBuilder password = new StringBuilder();
		for (char c : chars) {
			password.append(c);
		}
		return password.toString();
	}
}
