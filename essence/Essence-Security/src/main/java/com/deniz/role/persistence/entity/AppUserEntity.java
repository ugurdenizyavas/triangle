package com.deniz.role.persistence.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.UniqueConstraint;

import com.deniz.framework.persistence.entity.AbstractEntity;


@SuppressWarnings( "serial" )
@Entity
@Table( uniqueConstraints = { @UniqueConstraint( columnNames = { "USER_NAME" } ) } )
@SequenceGenerator( name = "ONE_SEQUENCE_PER_ENTITY_GENERATOR", sequenceName = "APP_USER_SEQ" )
public class AppUserEntity extends AbstractEntity
{
	private String userName;
	private String password;


	@Column(name = "USER_NAME")
	public String getUserName()
	{
		return userName;
	}


	public void setUserName( String userName )
	{
		this.userName = userName;
	}


	@Column(name = "PASSWORD")
	public String getPassword()
	{
		return password;
	}


	public void setPassword( String password )
	{
		this.password = password;
	}

	@Transient
	@Override
	public String getInfo()
	{
		return userName;
	}
}
