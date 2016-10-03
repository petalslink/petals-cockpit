/**
 * Copyright (C) 2016 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.ow2.petals.cockpit.server.security.mongo;

import java.util.Iterator;

import org.pac4j.core.context.Pac4jConstants;
import org.pac4j.core.context.WebContext;
import org.pac4j.core.credentials.UsernamePasswordCredentials;
import org.pac4j.core.credentials.authenticator.AbstractUsernamePasswordAuthenticator;
import org.pac4j.core.credentials.password.PasswordEncoder;
import org.pac4j.core.exception.AccountNotFoundException;
import org.pac4j.core.exception.BadCredentialsException;
import org.pac4j.core.exception.HttpAction;
import org.pac4j.core.exception.MultipleAccountsFoundException;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.core.util.CommonHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.allanbank.mongodb.MongoClient;
import com.allanbank.mongodb.MongoCollection;
import com.allanbank.mongodb.MongoDatabase;
import com.allanbank.mongodb.bson.Document;
import com.allanbank.mongodb.bson.Element;
import com.allanbank.mongodb.bson.element.StringElement;
import com.allanbank.mongodb.builder.QueryBuilder;

public class MongoAllanbankAuthenticator extends AbstractUsernamePasswordAuthenticator {

    protected final Logger logger = LoggerFactory.getLogger(getClass());

    /**
     * This must a list of attribute names separated by commas.
     */
    protected String attributes = "";

    protected String usernameAttribute = Pac4jConstants.USERNAME;

    protected String passwordAttribute = Pac4jConstants.PASSWORD;

    protected String usersDatabase = "users";

    protected String usersCollection = "users";

    protected MongoClient mongoClient;

    public MongoAllanbankAuthenticator() {
    }

    public MongoAllanbankAuthenticator(final MongoClient mongoClient) {
        this.mongoClient = mongoClient;
    }

    public MongoAllanbankAuthenticator(final MongoClient mongoClient, final String attributes) {
        this.attributes = attributes;
        this.mongoClient = mongoClient;
    }

    public MongoAllanbankAuthenticator(final MongoClient mongoClient, final String attributes,
            final PasswordEncoder passwordEncoder) {
        this.attributes = attributes;
        setPasswordEncoder(passwordEncoder);
        this.mongoClient = mongoClient;
    }

    @Override
    protected void internalInit(final WebContext context) {
        CommonHelper.assertNotNull("mongoClient", this.mongoClient);
        CommonHelper.assertNotNull("usernameAttribute", this.usernameAttribute);
        CommonHelper.assertNotNull("passwordAttribute", this.passwordAttribute);
        CommonHelper.assertNotNull("usersDatabase", this.usersDatabase);
        CommonHelper.assertNotNull("usersCollection", this.usersCollection);
        CommonHelper.assertNotNull("attributes", this.attributes);

        super.internalInit(context);
    }

    @Override
    public void validate(UsernamePasswordCredentials credentials, final WebContext context) throws HttpAction {

        final String username = credentials.getUsername();

        final Iterator<Document> it = getUsersFor(credentials).iterator();

        if (!it.hasNext()) {
            throw new AccountNotFoundException("No account found for: " + username);
        } else {
            final Document user = it.next();
            if (it.hasNext()) {
                throw new MultipleAccountsFoundException("Too many accounts found for: " + username);
            }
            final String returnedPassword = user.get(passwordAttribute).getValueAsString();
            if (!getPasswordEncoder().matches(credentials.getPassword(), returnedPassword)) {
                throw new BadCredentialsException("Bad credentials for: " + username);
            } else {
                final CommonProfile profile = createProfile(username, attributes.split(","), user);
                credentials.setUserProfile(profile);
            }
        }
    }

    private Iterable<Document> getUsersFor(UsernamePasswordCredentials credentials) {
        
        CommonHelper.assertNotNull("mongoClient", mongoClient);
        
        final MongoDatabase db = mongoClient.getDatabase(usersDatabase);
        final MongoCollection collection = db.getCollection(usersCollection);

        return collection.find(QueryBuilder.where(usernameAttribute).equals(credentials.getUsername()));
    }

    protected CommonProfile createProfile(final String username, final String[] attributes, final Document result) {
        final CommonProfile profile = new CommonProfile();
        profile.setId(username);
        for (String attribute : attributes) {
            final Element value = result.get(attribute);
            profile.addAttribute(attribute, value instanceof StringElement ? value.getValueAsString() : value);
        }
        return profile;
    }

    public String getAttributes() {
        return attributes;
    }

    public void setAttributes(String attributes) {
        this.attributes = attributes;
    }

    public String getUsernameAttribute() {
        return usernameAttribute;
    }

    public void setUsernameAttribute(String usernameAttribute) {
        this.usernameAttribute = usernameAttribute;
    }

    public String getPasswordAttribute() {
        return passwordAttribute;
    }

    public void setPasswordAttribute(String passwordAttribute) {
        this.passwordAttribute = passwordAttribute;
    }

    public String getUsersDatabase() {
        return usersDatabase;
    }

    public void setUsersDatabase(String usersDatabase) {
        this.usersDatabase = usersDatabase;
    }

    public String getUsersCollection() {
        return usersCollection;
    }

    public void setUsersCollection(String usersCollection) {
        this.usersCollection = usersCollection;
    }

    public MongoClient getMongoClient() {
        return mongoClient;
    }

    public void setMongoClient(MongoClient mongoClient) {
        this.mongoClient = mongoClient;
    }
}
