package com.deniz.role.persistence.entity;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinColumns;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.UniqueConstraint;

import com.deniz.framework.persistence.entity.AbstractEntity;


@SuppressWarnings( "serial" )
@Entity
@Table( uniqueConstraints = { @UniqueConstraint( columnNames = { "USER_ID", "USER_GROUP_ID" } ) } )
@SequenceGenerator( name = "ONE_SEQUENCE_PER_ENTITY_GENERATOR", sequenceName = "APP_USER_USER_GROUP_SEQ" )
public class AppUserUserGroupEntity extends AbstractEntity
{
	private AppUserEntity user;
	private AppUserGroupEntity userGroup;

	@ManyToOne
	@JoinColumns( { @JoinColumn( name = "USER_ID", referencedColumnName = "id", nullable = false )})
	public AppUserEntity getUser()
	{
		return user;
	}


	public void setUser( AppUserEntity user )
	{
		this.user = user;
	}


	@ManyToOne
	@JoinColumns( { @JoinColumn( name = "USER_GROUP_ID", referencedColumnName = "id", nullable = false )})
	public AppUserGroupEntity getUserGroup()
	{
		return userGroup;
	}


	public void setUserGroup( AppUserGroupEntity userGroup )
	{
		this.userGroup = userGroup;
	}


	@Transient
	@Override
	public String getInfo()
	{
		return "user " + user + " with group " + userGroup;
	}


}
