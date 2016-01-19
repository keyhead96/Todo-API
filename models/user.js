var bCrypt = require('bcryptjs');
var _ = require('underscore');


module.exports = function (sequelize, DataTypes) {
    return sequelize.define('todo', {
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]
            }
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });

};

module.exports = function (sequelize, DataTypes) {
    var user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7, 100]
            },
            set: function (value) {
                var salt = bCrypt.genSaltSync(10);
                var hashedPassword = bCrypt.hashSync(value, salt);

                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
        hooks: {
            beforeValidate: function (user, options) {
                if (typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function(loginDetails) {
                return new Promise(function (resolve, reject) {
                    if (typeof loginDetails.email !== 'string' || typeof loginDetails.password !== 'string') {
                        return reject();
                    }

                    user.findOne({
                        where: {
                            email: loginDetails.email
                        }
                    }).then(function (user) {
                        if (!user || !bCrypt.compareSync(loginDetails.password, user.get('password_hash'))) {
                            return reject();
                        }
                        resolve(user);
                    }, function (e) {
                        reject();
                    });
                });
            }
        },
        instanceMethods: {
            toPublicJSON: function () {
                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
            }
        }
    });
    
    return user;
};