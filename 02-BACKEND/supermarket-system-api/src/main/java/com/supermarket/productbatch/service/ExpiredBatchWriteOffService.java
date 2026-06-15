package com.supermarket.productbatch.service;

import com.supermarket.productbatch.dto.ExpiredWriteOffResultDTO;
import com.supermarket.user.entity.User;

public interface ExpiredBatchWriteOffService {

	ExpiredWriteOffResultDTO writeOffExpired(User actor);
}
