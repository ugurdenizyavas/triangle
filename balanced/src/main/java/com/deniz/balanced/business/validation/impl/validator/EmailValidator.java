package com.deniz.balanced.business.validation.impl.validator;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.deniz.balanced.framework.business.impl.validator.MetaValidator;
import com.deniz.framework.dto.Message;
import com.deniz.framework.dto.Meta;

public class EmailValidator implements MetaValidator {

	protected final Logger logger = LoggerFactory.getLogger(getClass());

	@Override
	public void validate(Meta meta) {
		String email = meta.getValue();
		int indexOfAt = StringUtils.indexOf(email, '@');
		int indexOfDot = StringUtils.indexOf(email, '.', indexOfAt);
		if ((indexOfAt < 1) || (indexOfDot < 1)) {
			this.logger.warn("Email " + email + " is not valid");
			meta.addError(new Message("Email " + email + " is not valid"));
		}
	}

}
