package com.deniz.framework.security;

import javax.servlet.http.HttpServletRequest;

/**
 * Providing the current active RequestInfo.
 * <p/>
 * Created: 31.03.2010 08:29:44<br/>
 * &copy; Informationsdesign AG
 * 
 * @author Ralf Th. Pietsch
 * @version $Revision$
 */
public interface RequestInfoProvider {
	/**
	 * Returns the current active RequestInfo for this call aka thread. Any
	 * attribute which can not be determined may be null.
	 * 
	 * @return A RequestInfo; but never null.
	 */
	public RequestInfo getCurrentRequestInfo(HttpServletRequest request);

	/**
	 * Returns the current active RequestInfo for this call aka thread. Any
	 * attribute which can not be determined may be null.
	 * 
	 * @return A RequestInfo; but never null.
	 */
	public RequestInfo getCurrentRequestInfo();
}
