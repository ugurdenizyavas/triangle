package com.deniz.framework.controller.model;

import java.util.List;

import org.json.JSONException;

import com.deniz.framework.controller.enums.CosJsonTypeEnum;
import com.deniz.framework.dto.Message;
import com.deniz.framework.dto.VariableValue;

public class CosJsonText extends CosJsonObject {

	public CosJsonText(String id, String value) throws JSONException {
		super(id);
		setType(CosJsonTypeEnum.text);
		this.setValue(value);
	}

	public void addErrors(List<Message> errors) throws JSONException {
		for (Message error : errors) {
			addError(error);
		}
	}

	public void addError(Message error) throws JSONException {
		String errorText = error.getLocalizerKey();
		for (VariableValue variableValue : error.getVariableValues()) {
			errorText += " | " + variableValue.getType().getName() + " : " + variableValue.getValue();
		}
		this.put("error", errorText);
	}
}
