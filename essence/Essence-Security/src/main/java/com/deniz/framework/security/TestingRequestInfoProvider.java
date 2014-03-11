package com.deniz.framework.security;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * <p/>
 * Created: 14.09.2010 12:51:30<br/>
 * &copy; Informationsdesign AG
 * 
 * @author Ralf Th. Pietsch
 * @version $Revision$
 */
public class TestingRequestInfoProvider implements RequestInfoProvider {
	// ==== static members ====

	// private static final Logger LOGGER = LoggerFactory.getLogger(
	// TestingRequestInfoProvider.class );

	// ==== private attributes ====

	private String testMode;

	private RequestInfo testRequestInfo;

	private RequestInfoProvider requestInfoProvider;

	// ==== private members ====

	// ==== constructors ====

	// ==== simple getters and setters ====

	public String isTestMode() {
		return testMode;
	}

	public void setTestMode(final String testMode) {
		this.testMode = testMode;
	}

	public void setTestRequestInfo(final RequestInfo testRequestInfo) {
		this.testRequestInfo = testRequestInfo;
	}

	public void setRequestInfoProvider(
			final RequestInfoProvider requestInfoProvider) {
		this.requestInfoProvider = requestInfoProvider;
	}

	// ==== "complex" getters and setters ====

	// ==== lifecycle methods ====

	// ==== interface RequestInfoProvider implementation ====

	public RequestInfo getCurrentRequestInfo(HttpServletRequest request) {
		boolean isTestMode = Boolean.parseBoolean(testMode);
		if (isTestMode) {
			return createTestRequestInfo(request);
		} else {
			return requestInfoProvider.getCurrentRequestInfo(request);
		}
	}

	// ==== business logic ====

	// ==== private methods ====

	private PojoRequestInfo createTestRequestInfo(HttpServletRequest request) {
		final PojoRequestInfo pojoRequestInfo = new PojoRequestInfo(
				testRequestInfo);

		// --- add the service id ---

		final String serviceId = request.getRequestURI().replaceFirst(
				".*/services/", "");
		pojoRequestInfo.setServiceId(serviceId);

		// ---

		return pojoRequestInfo;
	}

	@Override
	public RequestInfo getCurrentRequestInfo() {
		final PojoRequestInfo pojoRequestInfo = new PojoRequestInfo(
				testRequestInfo);
		
		// --- add the service id ---

		final HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder
				.getRequestAttributes()).getRequest();

		final String serviceId = request.getRequestURI().replaceFirst(
				".*/services/", "");
		pojoRequestInfo.setServiceId(serviceId);

		// ---

		return pojoRequestInfo;
	}

	// ==== methods from java.lang.Object ====

	// ==== inner classes ====
}
