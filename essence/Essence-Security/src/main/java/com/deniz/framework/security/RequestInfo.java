package com.deniz.framework.security;

import java.util.Locale;

/**
 * The RequestInfo-objects holds the request information from the dispatcher.
 * Object of this type are set by the DispatcherGateFilter and provided by
 * RequestInfoProvider.
 * Just use the StandardRequestInfoProvider in most case to get these objects.
 * Any of the attributes may be null, if dispatcher is not able to detect
 * those.
 * <p/>
 * You may distribute objects of this type to queue, etc. to ensure that
 * asynchronous processes are running in a user context ... etc.
 * <p/>
 * Created: 22.03.2010 11:26:59<br/>
 * &copy; Informationsdesign AG
 *
 * @author Ralf Th. Pietsch
 * @version $Revision$
 */
public interface RequestInfo 
{
	/**
	 * Returns the Dispatchers Session ID.  It's equivalent to S3-Session-ID in most cases.
	 * @return Returns the Dispatchers Session ID.
	 */
	public String getSessionId();

	/**
	 * Returns the instance ID.  This ID is similar to a cookie, but it indicates one specific
	 * client instance.
	 * @return Returns the instance ID.
	 */
	public String getInstanceId();

	/**
	 * Returns the unique request ID.
	 * Can commonly used to identify a specific request spreading along the system.
	 * Mainly used to trace a specific request.
	 * @return A unique RequestId-string; never null.
	 */
	public String getRequestId();

	/**
	 * Returns the user's login name.
	 * @return The user's login name, or null if no available.
	 */
	public String getUsername();

	/**
	 * Returns the locale.
	 * @return The Locale or null, if not available.
	 * @deprecated Use getLanguage instead. (2011-01-27, rtp.)
	 */
	public Locale getLocale();

	/**
	 * Return the language.
	 * @return The language or null, if not available.
	 */
	public String getLanguage();

	/**
	 * Returns the domain in which this service was called.
	 * This is the web domain and not the realm domain, which may differ.
	 * The returned value is only null, if the call is not done via dispatcher.
	 * @return The domain name, or null.
	 */
	public String getDomain();

	/**
	 * Returns the original ID of service, which was called at the dispatcher.
	 * This may differ from the concrete service ID of the called service in rare cases.
	 * The returned value is only null, if the call is not done via dispatcher.
	 * @return The Service ID, or null. 
	 */
	public String getServiceId();

	/**
	 * Returns the permission, which is needed to call this service.
	 * This comes from the serviceinfo-table in dispatcher.
	 * @return The permission string or null.
	 */
	public String getPermission();

	/**
	 * Returns the mandator under which this service is called.
	 * It is the mandator which is switch on currently for this user in this domain. 
	 * @return The mandator string or null.
	 */
	public String getMandator();

	/**
	 * Returns true, if this call is done via dispatcher.
	 * @return true, if this call is done via dispatcher.
	 */
	public boolean isViaDispatcher();
}
