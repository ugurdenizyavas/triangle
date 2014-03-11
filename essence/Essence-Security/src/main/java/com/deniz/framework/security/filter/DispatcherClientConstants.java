package com.deniz.framework.security.filter;

/**
 * <p/>
 * Created: 22.03.2010 12:49:14<br/>
 * &copy; Informationsdesign AG
 *
 * @author Ralf Th. Pietsch
 * @version $Revision$
 */
public interface DispatcherClientConstants
{
	//
	public static final String DISPATCHER_HEADER_FILTERED = "x-id-dispatcher-filtered";

	// user session info
	public static final String DISPATCHER_HEADER_REQUEST_SESSION_ID = "x-id-dispatcher-request-session-id";
	public static final String DISPATCHER_HEADER_REQUEST_USERNAME   = "x-id-dispatcher-request-username";
	public static final String DISPATCHER_HEADER_REQUEST_LANGUAGE   = "x-id-dispatcher-request-language";
	// user request info
	public static final String DISPATCHER_HEADER_REQUEST_MANDATOR   = "x-id-dispatcher-request-mandator";
	// request info
	public static final String DISPATCHER_HEADER_REQUEST_ID         = "x-id-dispatcher-request-id";
	public static final String DISPATCHER_HEADER_REQUEST_SERVICE_ID = "x-id-dispatcher-request-serviceid";
	// security info
	public static final String DISPATCHER_HEADER_REQUEST_DOMAIN     = "x-id-dispatcher-request-domain";
	public static final String DISPATCHER_HEADER_REQUEST_PERMISSION = "x-id-dispatcher-request-permission";

	// ---

	public static final String ID_HEADER_CONTENT_TYPE = "x-id-content-type";

	public static final String ID_HEADER_INSTANCE     = "x-id-instance";
	public static final String ID_HEADER_SET_INSTANCE = "x-id-set-instance";

	// ---

	public static final String ATTRIBUTE_KEY_REQUEST_INFO = "dispatcher.request-info";
	
}
