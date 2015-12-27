if (typeof jQuery === 'undefined') {
    throw new Error('We need jQuery if we want to work together bro')
}

var pleaseWaitDiv = jQuery('<div class="modal" id="pleaseWaitDialog"><div class="modal-dialog modal-lg"><div class="modal-content"></div></div></div>');
jQuery('body').append(pleaseWaitDiv);

var loadingBar;
loadingBar = loadingBar || (function () {
        var generateBar = '<div class="modal-header"><h1><i>Procesando...</i></h1></div><div class="progress progress-striped active"><div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 10%;"></div></div>';
        return {
            showBar: function (div) {
                jQuery(div).html(generateBar);
                i = 10;
                setInterval(function () {
                    jQuery('.progress-bar').css('width', i + '%');
                    i = i + 15;
                }, 200)
            }
        };
    })();

(function ($) {
    $.fn.extend({
        dmodal: function (options) {
            var defaults = {
                children: (typeof(options) === 'string') ? options : '',
                trigger: 'click',
                ldURL: null,
                callback: function (param) {
                }
            };

            var obj = $(this);

            var opts = $.extend({}, defaults, options);

            obj.on(opts.trigger, opts.children, function (event) {
                event.preventDefault();
                url = (opts.ldURL != null) ? opts.ldURL : $(this).attr('href');
                modalElement = $('.modal');
                modalContent = $('.modal-content');
                modalElement.modal('hide');
                loadingBar.showBar('.modal-content');
                modalContent.load(url);
                modalElement.modal('show');
            });
            if (opts.trigger == 'auto' && opts.ldURL != null) {
                modalElement.modal('hide');
                loadingBar.showBar('.modal-content');
                modalContent.load(opts.ldURL);
                modalElement.modal('show');
            }
        }
    });
})(jQuery);

(function ($) {
    $.fn.extend({
        saveformdata: function (options) {

            var defaults = {
                element: (typeof(options) === 'string') ? options : '#error-message',
                child: '',
                sbmtURL: '',
                callback: function (param) {
                },
                cbOnfail: false,
                reloadHtml: false,
                rlUrl: '',
                rlContainer: '',
                closeModal: false,
                mdElement: '.modal',
                clrForm: '',
                data: ''
            };

            var opts = $.extend({}, defaults, options);

            this.each(function () {
                var obj = $(this);
                obj.on('submit', opts.child, function (event) {
                    event.preventDefault();

                    var data = (opts.data != '') ? opts.data : $(this).serialize();
                    var url = (opts.sbmtURL != '') ? opts.sbmtURL : $(this).attr('action');
                    var savedatamsgcontainer = $(opts.element);

                    savedatamsgcontainer.html('Procesando, por favor espere...').removeClass().addClass('alert alert-info flying-message');

                    savedatamsgcontainer.slideDown('slow');

                    savedatamsgcontainer.on('click', function () {
                        jQuery(this).slideUp('slow');
                    });

                    $.post(url, data, function (json) {
                            if (json.error) {
                                savedatamsgcontainer.removeClass('alert-info').addClass('alert-danger').html(json.message);
                            }
                            else {
                                savedatamsgcontainer.removeClass('alert-info').addClass('alert-success').html(json.message);
                            }
                        }, 'json')
                        .done(function (response) {
                            setTimeout(function () {
                                savedatamsgcontainer.slideUp('slow')
                            }, 3000);
                            if (!response.error) {
                                if (opts.reloadhtml) {
                                    loadingBar.showBar(opts.rlContainer);
                                    $(opts.rlContainer).load(opts.rlUrl);
                                }
                                if (opts.clrForm != '') {
                                    $(opts.clrForm).each(function () {
                                        this.reset();
                                    })
                                }
                                if (opts.closeModal)
                                    $(opts.mdElement).modal('hide');

                                if (typeof(opts.callback) === 'function') {
                                    opts.callback.call(this, response);
                                }
                            } else {
                                if (opts.cbOnfail) {
                                    if (typeof(opts.callback === 'function')) {
                                        opts.callback.call(this, response);
                                    }
                                }
                            }
                        })
                        .fail(function (jqxhr, textStatus, error) {
                            var err = textStatus + ", " + error;
                            savedatamsgcontainer.removeClass('alert-info').addClass('alert-danger').html('Lo sentimos, hubo un problema al procesar tu solicitud ' + err);
                        })
                })
            })
        }
    });
})(jQuery);

(function ($) {
    "use strict";

    var options = {
            errors: [],
            // Options
            minChar: 8,
            errorMessages: {
                password_to_short: "La clave es muy corta",
                same_as_username: "Tu clave no puede ser igual a tu nombre de usuario"
            },
            scores: [17, 26, 40, 50],
            verdicts: ["Debil", "Normal", "Media", "Fuerte", "Muy Fuerte"],
            showVerdicts: true,
            raisePower: 1.4,
            usernameField: "#username",
            onLoad: undefined,
            onKeyUp: undefined,
            viewports: {
                progress: undefined,
                verdict: undefined,
                errors: undefined
            },
            // Rules stuff
            ruleScores: {
                wordNotEmail: -100,
                wordLength: -100,
                wordSimilarToUsername: -100,
                wordLowercase: 1,
                wordUppercase: 3,
                wordOneNumber: 3,
                wordThreeNumbers: 5,
                wordOneSpecialChar: 3,
                wordTwoSpecialChar: 5,
                wordUpperLowerCombo: 2,
                wordLetterNumberCombo: 2,
                wordLetterNumberCharCombo: 2
            },
            rules: {
                wordNotEmail: true,
                wordLength: true,
                wordSimilarToUsername: true,
                wordLowercase: true,
                wordUppercase: true,
                wordOneNumber: true,
                wordThreeNumbers: true,
                wordOneSpecialChar: true,
                wordTwoSpecialChar: true,
                wordUpperLowerCombo: true,
                wordLetterNumberCombo: true,
                wordLetterNumberCharCombo: true
            },
            validationRules: {
                wordNotEmail: function (options, word, score) {
                    return word.match(/^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i) && score;
                },
                wordLength: function (options, word, score) {
                    var wordlen = word.length,
                        lenScore = Math.pow(wordlen, options.raisePower);
                    if (wordlen < options.minChar) {
                        lenScore = (lenScore + score);
                        options.errors.push(options.errorMessages.password_to_short);
                    }
                    return lenScore;
                },
                wordSimilarToUsername: function (options, word, score) {
                    var username = $(options.usernameField).val();
                    if (username && word.toLowerCase().match(username.toLowerCase())) {
                        options.errors.push(options.errorMessages.same_as_username);
                        return score;
                    }
                    return true;
                },
                wordLowercase: function (options, word, score) {
                    return word.match(/[a-z]/) && score;
                },
                wordUppercase: function (options, word, score) {
                    return word.match(/[A-Z]/) && score;
                },
                wordOneNumber: function (options, word, score) {
                    return word.match(/\d+/) && score;
                },
                wordThreeNumbers: function (options, word, score) {
                    return word.match(/(.*[0-9].*[0-9].*[0-9])/) && score;
                },
                wordOneSpecialChar: function (options, word, score) {
                    return word.match(/.[!,@,#,$,%,\^,&,*,?,_,~]/) && score;
                },
                wordTwoSpecialChar: function (options, word, score) {
                    return word.match(/(.*[!,@,#,$,%,\^,&,*,?,_,~].*[!,@,#,$,%,\^,&,*,?,_,~])/) && score;
                },
                wordUpperLowerCombo: function (options, word, score) {
                    return word.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/) && score;
                },
                wordLetterNumberCombo: function (options, word, score) {
                    return word.match(/([a-zA-Z])/) && word.match(/([0-9])/) && score;
                },
                wordLetterNumberCharCombo: function (options, word, score) {
                    return word.match(/([a-zA-Z0-9].*[!,@,#,$,%,\^,&,*,?,_,~])|([!,@,#,$,%,\^,&,*,?,_,~].*[a-zA-Z0-9])/) && score;
                }
            }
        },

        setProgressBar = function ($el, score) {
            var options = $el.data("pwstrength"),
                progressbar = options.progressbar,
                $verdict;

            if (options.showVerdicts) {
                if (options.viewports.verdict) {
                    $verdict = $(options.viewports.verdict).find(".password-verdict");
                } else {
                    $verdict = $el.parent().find(".password-verdict");
                    if ($verdict.length === 0) {
                        $verdict = $('<span class="password-verdict"></span>');
                        $verdict.insertAfter($el);
                    }
                }
            }

            if (score < options.scores[0]) {
                progressbar.addClass("progress-bar-danger").removeClass("progress-bar-warning").removeClass("progress-bar-success");
                progressbar.find(".bar").css("width", "5%");
                if (options.showVerdicts) {
                    $verdict.text(options.verdicts[0]);
                }
            } else if (score >= options.scores[0] && score < options.scores[1]) {
                progressbar.addClass("progress-bar-danger").removeClass("progress-bar-warning").removeClass("progress-bar-success");
                progressbar.find(".bar").css("width", "25%");
                if (options.showVerdicts) {
                    $verdict.text(options.verdicts[1]);
                }
            } else if (score >= options.scores[1] && score < options.scores[2]) {
                progressbar.addClass("progress-bar-warning").removeClass("progress-bar-danger").removeClass("progress-bar-success");
                progressbar.find(".bar").css("width", "50%");
                if (options.showVerdicts) {
                    $verdict.text(options.verdicts[2]);
                }
            } else if (score >= options.scores[2] && score < options.scores[3]) {
                progressbar.addClass("progress-bar-warning").removeClass("progress-bar-danger").removeClass("progress-bar-success");
                progressbar.find(".bar").css("width", "75%");
                if (options.showVerdicts) {
                    $verdict.text(options.verdicts[3]);
                }
            } else if (score >= options.scores[3]) {
                progressbar.addClass("progress-bar-success").removeClass("progress-bar-warning").removeClass("progress-bar-danger");
                progressbar.find(".bar").css("width", "100%");
                if (options.showVerdicts) {
                    $verdict.text(options.verdicts[4]);
                }
            }
        },

        calculateScore = function ($el) {
            var self = this,
                word = $el.val(),
                totalScore = 0,
                options = $el.data("pwstrength");

            $.each(options.rules, function (rule, active) {
                if (active === true) {
                    var score = options.ruleScores[rule],
                        result = options.validationRules[rule](options, word, score);
                    if (result) {
                        totalScore += result;
                    }
                }
            });
            setProgressBar($el, totalScore);
            return totalScore;
        },

        progressWidget = function () {
            return '<div class="progress progress-striped active"><div class="progress-bar"></div></div>';
        },

        methods = {
            init: function (settings) {
                var self = this,
                    allOptions = $.extend(options, settings);

                return this.each(function (idx, el) {
                    var $el = $(el),
                        progressbar,
                        verdict;

                    $el.data("pwstrength", allOptions);

                    $el.on("keyup", function (event) {
                        var options = $el.data("pwstrength");
                        options.errors = [];
                        calculateScore.call(self, $el);
                        if ($.isFunction(options.onKeyUp)) {
                            options.onKeyUp(event);
                        }
                    });

                    progressbar = $(progressWidget());
                    if (allOptions.viewports.progress) {
                        $(allOptions.viewports.progress).append(progressbar);
                    } else {
                        progressbar.insertAfter($el);
                    }
                    progressbar.find(".bar").css("width", "0%");
                    $el.data("pwstrength").progressbar = progressbar;

                    if (allOptions.showVerdicts) {
                        verdict = $('<span class="password-verdict">' + allOptions.verdicts[0] + '</span>');
                        if (allOptions.viewports.verdict) {
                            $(allOptions.viewports.verdict).append(verdict);
                        } else {
                            verdict.insertAfter($el);
                        }
                    }

                    if ($.isFunction(allOptions.onLoad)) {
                        allOptions.onLoad();
                    }
                });
            },

            destroy: function () {
                this.each(function (idx, el) {
                    var $el = $(el);
                    $el.parent().find("span.password-verdict").remove();
                    $el.parent().find("div.progress").remove();
                    $el.parent().find("ul.error-list").remove();
                    $el.removeData("pwstrength");
                });
            },

            forceUpdate: function () {
                var self = this;
                this.each(function (idx, el) {
                    var $el = $(el),
                        options = $el.data("pwstrength");
                    options.errors = [];
                    calculateScore.call(self, $el);
                });
            },

            outputErrorList: function () {
                this.each(function (idx, el) {
                    var output = '<ul class="error-list">',
                        $el = $(el),
                        errors = $el.data("pwstrength").errors,
                        viewports = $el.data("pwstrength").viewports,
                        verdict;
                    $el.parent().find("ul.error-list").remove();

                    if (errors.length > 0) {
                        $.each(errors, function (i, item) {
                            output += '<li>' + item + '</li>';
                        });
                        output += '</ul>';
                        if (viewports.errors) {
                            $(viewports.errors).html(output);
                        } else {
                            output = $(output);
                            verdict = $el.parent().find("span.password-verdict");
                            if (verdict.length > 0) {
                                el = verdict;
                            }
                            output.insertAfter(el);
                        }
                    }
                });
            },

            addRule: function (name, method, score, active) {
                this.each(function (idx, el) {
                    var options = $(el).data("pwstrength");
                    options.rules[name] = active;
                    options.ruleScores[name] = score;
                    options.validationRules[name] = method;
                });
            },

            changeScore: function (rule, score) {
                this.each(function (idx, el) {
                    $(el).data("pwstrength").ruleScores[rule] = score;
                });
            },

            ruleActive: function (rule, active) {
                this.each(function (idx, el) {
                    $(el).data("pwstrength").rules[rule] = active;
                });
            }
        };

    $.fn.pwstrength = function (method) {
        var result;
        if (methods[method]) {
            result = methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            result = methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on jQuery.pwstrength");
        }
        return result;
    };
}(jQuery));