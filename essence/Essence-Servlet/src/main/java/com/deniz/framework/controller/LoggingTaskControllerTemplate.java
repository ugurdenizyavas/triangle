package com.deniz.framework.controller;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.mvc.multiaction.MultiActionController;

import com.deniz.framework.dto.AbstractDto;
import com.deniz.framework.logging.LoggingHelper;


/**
 * Base class that is used for all controller classes.
 * <p/>
 * @author Deniz Yavas
 */
public abstract class LoggingTaskControllerTemplate extends MultiActionController {
    protected final Logger logger = LoggerFactory.getLogger(getClass());

	protected static final String LOG_EVENT_USER_PRESSED_PREVIOUS = "User pressed previous.";
	protected static final String LOG_EVENT_USER_PRESSED_NEXT = "User pressed next.";
	protected static final String LOG_EVENT_USER_PRESSED_SAVE = "User pressed save.";

	/**
	 * Logs a service call that deals with a dto object on INFO level.
	 * 
	 * @param request
	 *            The HttpServletRequest that will be used to extract the
	 *            service url, e.g. "flight.newReportBackOffice/header/next"
	 * @param abstractDto
	 *            the dto that was persisted.
	 * @param event
	 *            The event that happened, e.g. "User pressed next."
	 * @param systemReaction
	 *            How did the system react, e.g.
	 *            "Show previous task with errors because report contained validation errors."
	 */
	protected void logServiceCall(HttpServletRequest request,
			AbstractDto abstractDto, String event, String systemReaction) {
		if (abstractDto != null) {
			String typeAndPk = LoggingHelper.getTypeAndPk(abstractDto);
			String info = abstractDto.getInfo();
			logServiceCallInfo(request.getPathInfo(), typeAndPk, info, event,
					systemReaction);
		} else {
			logServiceCallInfo(request.getPathInfo(), null, null, event,
					systemReaction);
		}
	}

	/**
	 * Logs a service call that deals with a generic object on INFO level.
	 * 
	 * This method should only be used in exceptional cases where you do not
	 * have a dto object. Usually you would use
	 * ControllerTemplate#logServiceCall.
	 * 
	 * @param request
	 *            The HttpServletRequest that will be used to extract the
	 *            service url, e.g. "flight.newReportBackOffice/header/next"
	 * @param businessObjectType
	 *            e.g. "SearchField"
	 * @param businessObjectTechnicalPk
	 *            The technical key used ito identify the business object e.g.
	 *            "45"
	 * @param info
	 *            Headline type info about the business object, e.g.
	 *            "reportNumber"
	 * @param event
	 *            The event that happened, e.g. "User pressed next."
	 * @param systemReaction
	 *            How did the system react, e.g.
	 *            "Show previous task with errors because report contained validation errors."
	 * @see LoggingTaskControllerTemplate#logServiceCall(javax.servlet.http.HttpServletRequest,
	 *      aero.deniz.cos.libraries.dto.AbstractDto, String, String)
	 */
	protected void logServiceCallGenericObject(HttpServletRequest request,
			String businessObjectType, String businessObjectTechnicalPk,
			String info, String event, String systemReaction) {
		logServiceCallInfo(request.getPathInfo(), businessObjectType + ":"
				+ businessObjectTechnicalPk, info, event, systemReaction);
	}

	/**
	 * Logs a save, updated or delete operation on INFO level. </p>
	 * 
	 * @param url
	 *            The service url, e.g. "flight.newReportBackOffice/header/next"
	 * @param typeAndPk
	 *            e.g. 'ReportDto:7887' or 'Field:45'
	 * @param info
	 *            should be taken from AbstractDto.getInfo or
	 *            AbstractEntity.getInfo e.g. "#2011-77845844 'Birdstrike'"
	 * @param event
	 *            The event that happened, e.g. "User pressed next."
	 * @param systemReaction
	 *            How did the system react, e.g.
	 *            "Show previous task with errors because report contained validation errors."
	 */
	private void logServiceCallInfo(String url, String typeAndPk, String info,
			String event, String systemReaction) {
		String logString = "SERVICE: " + url + " BUSINESS-OBJECT (" + typeAndPk
				+ "): " + info + " EVENT: " + event + " REACTION: "
				+ systemReaction;
		logger.info(logString);
	}

}
