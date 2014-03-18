package com.deniz.balanced.business.validation.impl.validator;

import com.deniz.balanced.framework.business.impl.validator.MetaValidator;
import com.deniz.framework.dto.Message;
import com.deniz.framework.dto.Meta;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PasswordValidator implements MetaValidator {

	protected final Logger logger = LoggerFactory.getLogger(getClass());

	@Override
	public void validate(Meta meta) {
		String password = meta.getValue();

		if (StringUtils.isNotEmpty(password)) {
			if (password.length() >= 8) {
				if (StringUtils.isAlphanumeric(password)) {
					logger.debug("Password " + password + " is accepted.");
				} else {
					meta.addError(new Message("Password should only contain numbers or alphabetic characters."));
				}
			} else {
				meta.addError(new Message("Password should be 8 characters at least."));
			}
		} else {
			meta.addError(new Message("Password can not be blank"));
		}

	}
}
