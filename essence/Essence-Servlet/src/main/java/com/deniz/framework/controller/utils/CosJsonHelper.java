package com.deniz.framework.controller.utils;

import org.json.JSONException;

import com.deniz.framework.controller.model.CosJsonObject;
import com.deniz.framework.controller.model.CosJsonProcess;
import com.deniz.framework.controller.model.CosJsonTask;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;

public class CosJsonHelper {

	public static CosJsonProcess createProcess(String processId, boolean isProcessInit) throws JSONException {
		CosJsonProcess process = updateProcess(processId);
		if (isProcessInit) {
			process.init();
		}
		return process;
	}

	public static CosJsonProcess updateProcess(String processId) throws JSONException {
		return new CosJsonProcess(processId);
	}

	public static CosJsonTask initializeTask(String taskId) throws JSONException {
		return (CosJsonTask) updateTask(taskId).init();
	}

	public static CosJsonTask updateTask(String taskControllerUrl) throws JSONException {
		return new CosJsonTask(taskControllerUrl);
	}

	public static void lockUnlock(CosJsonObject cosJsonObject, boolean lock) throws JSONException {
		if (lock) {
			cosJsonObject.lock();
		} else {
			cosJsonObject.unlock();
		}
	}

	public static String prettyJson(CosJsonProcess processJson) {
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		JsonParser jp = new JsonParser();
		JsonElement je = jp.parse(processJson.toString());
		String finalJson = gson.toJson(je);
		return finalJson;
	}
}