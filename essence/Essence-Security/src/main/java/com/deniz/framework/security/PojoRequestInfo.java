package com.deniz.framework.security;

import java.io.Serializable;
import java.util.Locale;

/**
 * The pojo implementation used in DispatcherGateFilter.
 * <p/>
 * Created: 22.03.2010 11:50:14<br/>
 * &copy; Informationsdesign AG
 *
 * @author Ralf Th. Pietsch
 * @version $Revision$
 */
public class PojoRequestInfo implements RequestInfo, Serializable
{
	// ==== static members ====

	// ==== private attributes ====

	private String sessionId;
	private String requestId;
	private String instanceId;

	private String username;
	private String language;

	private String serviceId;

	private String mandator;
	private String permission;
	private String domain;

	public boolean viaDispatcher;

	// ==== private members ====

	// ==== constructors ====

	public PojoRequestInfo()
	{
	}

	public PojoRequestInfo( final RequestInfo requestInfo )
	{
		sessionId = requestInfo.getSessionId();
		requestId = requestInfo.getRequestId();
		instanceId = requestInfo.getInstanceId();

		username = requestInfo.getUsername();
		language = requestInfo.getLanguage();

		serviceId = requestInfo.getServiceId();

		mandator = requestInfo.getMandator();
		permission = requestInfo.getPermission();
		domain = requestInfo.getDomain();

		viaDispatcher = requestInfo.isViaDispatcher();
	}

	// ==== simple getters and setters ====

	public void setSessionId( String sessionId )
	{
		this.sessionId = sessionId;
	}

	public void setRequestId( String requestId )
	{
		this.requestId = requestId;
	}

	public void setInstanceId( final String instanceId )
	{
		this.instanceId = instanceId;
	}

	public void setUsername( String username )
	{
		this.username = username;
	}

	public void setLanguage( String language )
	{
		this.language = language;
	}

	public void setServiceId( String serviceId )
	{
		this.serviceId = serviceId;
	}

	public void setPermission( String permission )
	{
		this.permission = permission;
	}

	public void setDomain( String domain )
	{
		this.domain = domain;
	}

	public void setMandator( String mandator )
	{
		this.mandator = mandator;
	}

	public void setViaDispatcher( boolean viaDispatcher )
	{
		this.viaDispatcher = viaDispatcher;
	}

	// ==== "complex" getters and setters ====

	// ==== lifecycle methods ====

	// ==== interface RequestInfo implementation ====

	public String getSessionId()
	{
		return sessionId;
	}

	public String getInstanceId()
	{
		return instanceId;
	}

	public String getRequestId()
	{
		return requestId;
	}

	public String getUsername()
	{
		return username;
	}

	public Locale getLocale()
	{
		return language == null ? null : new Locale( language );
	}

	public String getLanguage()
	{
		return language;
	}

	public String getServiceId()
	{
		return serviceId;
	}

	public String getPermission()
	{
		return permission;
	}

	public String getDomain()
	{
		return domain;
	}

	public String getMandator()
	{
		return mandator;
	}

	public boolean isViaDispatcher()
	{
		return viaDispatcher;
	}

	// ==== business logic ====

	// ==== private methods ====

	// ==== methods from java.lang.Object ====


	@Override
	public String toString()
	{
		return "PojoRequestInfo(" +
			"sessionId=" + sessionId + "," +
			"instanceId=" + instanceId + "," +
			"requestId=" + requestId + "," +
			"username=" + username + "," +
			"language=" + language + "," +
			"serviceId=" + serviceId + "," +
			"mandator=" + mandator + "," +
			"permission=" + permission + "," +
			"domain=" + domain + "," +
			"viaDispatcher=" + viaDispatcher + ")";
	}
}
