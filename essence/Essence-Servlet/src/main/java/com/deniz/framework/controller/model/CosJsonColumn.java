package com.deniz.framework.controller.model;

import org.json.JSONException;

import com.deniz.framework.controller.enums.CosJsonTypeEnum;

public class CosJsonColumn extends CosJsonObject {
	/**
	 * Default constructor
	 * 
	 * @param objectId id for the given object
	 * @param type
	 * @throws JSONException
	 */
	public CosJsonColumn(String objectId, CosJsonTypeEnum type) throws JSONException {
		super(objectId);
		this.setType(type);
	}

	/**
	 * We have text json column as the primary constructor; since it is the most
	 * commonly used. If you want to add another type, use {@link com.deniz.framework.controller.model.CosJsonColumn#CosJsonColumn(String, CosJsonTypeEnum)}
	 * 
	 * @param objectId id for the given object
	 * @param label
	 * @throws JSONException
	 */
	public CosJsonColumn(String objectId, String label) throws JSONException {
		super(objectId);
		this.setType(CosJsonTypeEnum.text).setLabel(label);
	}

	public CosJsonColumn(String objectId) throws JSONException {
		this(objectId, CosJsonTypeEnum.text);
	}
}
