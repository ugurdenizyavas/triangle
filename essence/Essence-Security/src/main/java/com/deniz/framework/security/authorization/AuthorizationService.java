package com.deniz.framework.security.authorization;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

import com.deniz.framework.security.PojoRequestInfo;

public class AuthorizationService {

	private String hostbase;
	private String hostport;

	public void setHostbase(String hostbase) {
		this.hostbase = hostbase;
	}

	public void setHostport(String hostport) {
		this.hostport = hostport;
	}

	public String authenticate(PojoRequestInfo requestInfo) throws IOException {
		URL authorizationGateway = new URL("http://" + hostbase + ":" + hostport + "/UserAdministration/services/authorization/init?username="
				+ requestInfo.getUsername() + "&domain=" + requestInfo.getDomain());
		URLConnection yc = authorizationGateway.openConnection();
		BufferedReader in = new BufferedReader(new InputStreamReader(yc.getInputStream()));

		String responseLine = "";
		String inputLine;
		while ((inputLine = in.readLine()) != null) {
			responseLine += inputLine;
		}
		in.close();
		return responseLine;
	}

}
