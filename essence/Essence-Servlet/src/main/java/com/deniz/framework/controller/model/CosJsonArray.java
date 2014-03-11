package com.deniz.framework.controller.model;

import java.util.List;

public class CosJsonArray<E extends CosJsonObject> extends CosJsonStringArray {

	public CosJsonArray() {
		super();
	}

	public CosJsonArray<E> addObjects(List<E> jsonObjects) {
		for (E jsonObject : jsonObjects) {
			this.put(jsonObject);
		}
		return (CosJsonArray<E>) this;
	}

	public CosJsonArray<E> addArrays(List<CosJsonStringArray> jsonArrays) {
		for (CosJsonStringArray jsonArray : jsonArrays) {
			this.put(jsonArray);
		}
		return (CosJsonArray<E>) this;
	}

	public CosJsonArray<E> addObjects(E jsonObject) {
		this.put(jsonObject);
		return (CosJsonArray<E>) this;
	}
}
