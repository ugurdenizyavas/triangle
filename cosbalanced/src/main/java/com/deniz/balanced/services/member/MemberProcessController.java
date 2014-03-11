package com.deniz.balanced.services.member;

import com.deniz.balanced.framework.constants.FrameworkLocalizerKeys;
import com.deniz.framework.controller.ProcessControllerTemplate;

import java.util.LinkedHashMap;

public class MemberProcessController extends ProcessControllerTemplate {

	@Override
	public LinkedHashMap<String, Boolean> getLockMap() {
		LinkedHashMap<String, Boolean> lockMap = new LinkedHashMap<String, Boolean>();
		lockMap.put(FrameworkLocalizerKeys.TASK_NAME_OVERVIEW, false);
		lockMap.put(FrameworkLocalizerKeys.TASK_NAME_DETAILS, true);
		lockMap.put(FrameworkLocalizerKeys.TASK_NAME_INFO, false);
		return lockMap;
	}

}
