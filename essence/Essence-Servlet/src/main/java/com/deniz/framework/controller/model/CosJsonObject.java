package com.deniz.framework.controller.model;

import org.apache.commons.lang.StringUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.deniz.framework.controller.enums.CosJsonFormatEnum;
import com.deniz.framework.controller.enums.CosJsonModeEnum;
import com.deniz.framework.controller.enums.CosJsonTypeEnum;

public class CosJsonObject extends JSONObject {

	public CosJsonObject() {
		super();
	}

	public CosJsonObject(String objectId) throws JSONException {
		super();
		setId(objectId);
	}

	private CosJsonObject setId(String objectId) throws JSONException {
		return (CosJsonObject) this.put("id", objectId);
	}

	public CosJsonObject lock() throws JSONException {
		return (CosJsonObject) this.put("locked", true);
	}

	public CosJsonObject unlock() throws JSONException {
		return (CosJsonObject) this.put("locked", false);
	}

	public CosJsonObject init() throws JSONException {
		return (CosJsonObject) this.put("mode", CosJsonModeEnum.init);
	}

	public CosJsonObject update() throws JSONException {
		return (CosJsonObject) this.put("mode", CosJsonModeEnum.update);
	}

	public CosJsonObject setValue(String value) throws JSONException {
		return (CosJsonObject) this.put("value", value);
	}

	public CosJsonObject setLabel(String label) throws JSONException {
		return (CosJsonObject) this.put("label", label);
	}

	public CosJsonObject setType(CosJsonTypeEnum type) throws JSONException {
		return (CosJsonObject) this.put("type", type.name());
	}

	public CosJsonObject setFormat(CosJsonFormatEnum format) throws JSONException {
		return (CosJsonObject) this.put("format", format.name());
	}

	@Override
	public CosJsonObject put(String key, Object value) throws JSONException {
		if (StringUtils.isEmpty(key)) {
			throw new RuntimeException("Json key cannot be null.");
		}
		return (CosJsonObject) super.put(key, value);
	}

	public CosJsonObject setItems(JSONArray itemsArray) throws JSONException {
		return (CosJsonObject) this.put("items", itemsArray);
	}

	public CosJsonObject hide() throws JSONException {
		return (CosJsonObject) this.put("hidden", true);
	}

}
