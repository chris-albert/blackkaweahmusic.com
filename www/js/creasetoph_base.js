/**
 * This is where all the base classes for the rest of the application will reside
 * @author creasetoph
 */
(function() {
    C$.inherit('CreasetophController','').prototype = {
        Events: {
            'click': 'onClick'
        },
        init: function() {
            this.Model = creasetoph.CreasetophModel.prototype;
        },
        onClick: function(e) {
            var link = $(e.originalTarget).get_attribute(C$.link_name);
            if(link !== null) {
                this.Model.navigate(link);
            }
        },
        bind_event: function(scope,event,func_name,el) {
            this.Events[event] = func_name;
            this[func_name] = function(e) {
                scope[func_name](e);
            }
            el = el || this.element
            $(el).attach_event(event,this.object);
        },
        bind_events: function(el) {
            el = el || this.element;
            for(var i in this.Events) {
                if(this.Events.hasOwnProperty(i)) {
                    $(el).attach_event(i,this.object);
                }
            }
        },
        unbind_event: function(event,el) {
            el = el || this.element;
            $(el).remove_event(event);
        },
        unbind_events: function(el) {
            el = el || this.element;
            for(var i in this.Events) {
                if(this.Events.hasOwnProperty(i)) {
                    $(el).remove_event(i);
                }
            }
        },
        destroy: function() {
            this.unbind_events(this.element);
        }
    };
    
    C$.inherit('CreasetophForm','CreasetophController').prototype = {
        Events: {
            'click': 'onSubmit'
        },
        root_el: null,
        form_elements: [],
        form_controllers: [],
        valid: false,
        valid_elements: [],
        invalid_elements: [],
        submit_button: null,
        submit_enabled: null,
        errors: [],
        elements_to_find:[
            'input',
            '.crease_button',
            'textarea',
            'select'
        ],
        onKeyDown: function(e) {
            if(e.keyCode === 13 && this.valid) {
                this.onSubmit();
            }
        },
        onBaseFormBind: function(el) {
            this.submit_enabled = null;
            this.valid = false;
            this.Model = creasetoph.CreasetophModel.prototype;
            this.root_el = el;
            this.get_form_elements();
            this.get_form_controllers();
            this.validate();
        },
        get_form_elements: function() {
            this.form_elements = $(this.root_el).get_child(this.elements_to_find);
        },
        get_form_controllers: function() {
            this.form_controllers = [];
            for(var i in this.form_elements) {
                var att = $(this.form_elements[i]).get_controller();
                if(att !== null) {
                    this.form_controllers.push(C$.find_object(att));
                    C$.find_object(att).prototype.bind_event(this,'keydown','onKeyDown');
                }
                
                if($(this.form_elements[i]).get_attribute('submit') === 'true') {
                    this.submit_button = this.form_elements[i];
//                    $(this.submit_button).attach_event('click',this.object);
//                    $(this.submit_button).set_controller_attribute(this.object.class_name);
                }
            }
        },
        validate: function() {
            this.errors = [];
            this.valid = true;
            for(var i in this.form_controllers) {
                if(typeof this.form_controllers[i].prototype.validate === 'function') {
                    var ret = this.form_controllers[i].prototype.validate();
                    if(ret !== true) {
                        this.errors.push(ret);
                        this.valid = false;
                    }
                }
            }
            if(!this.valid) {
                this.disable_submit();
            }else {
                this.enable_submit();
            }
        },
        get_error_message: function() {
            var i,
                message = "Before you submit you must:<hr /><span class='error_list'>";
            for(i in this.errors) {
                message +=  '&nbsp;' + (parseInt(i) + 1) +': ' + this.errors[i] + '<br />';
            }
            message += "</span>";
            return message;
        },
        disable_submit: function() {
            if(this.submit_button !== null) {
                if(this.submit_enabled || this.submit_enabled === null) {
                    $(this.submit_button)
                        .remove_controller_attribute()
                        .remove_event('click')
                        .add_class('disabled')
                        .css({cursor: 'help'})
                        .add_dialog('CreasetophErrorDialog',{
                            dialog_content: this.get_error_message(),
                            dialog_height : '',
                            dialog_width  : '',
                            dialog_custom_base_class: 'creasetoph_error_dialog'
                        });
                    this.submit_enabled = false;
                }else {
                    C$.find_object('CreasetophErrorDialog').prototype.dialog_content = this.get_error_message();
                }
            }
        },
        enable_submit: function() {
            if(this.submit_button !== null) {
                if(!this.submit_enabled || this.submit_enabled === null) {
                    $(this.submit_button)
                        .remove_class('disabled')
                        .css({cursor: 'pointer'})
                        .remove_controller()
                        .set_controller_attribute(this.object.class_name)
                        .attach_event('click',this.object);
                    this.submit_enabled = true;
                }
            }
        },
        onSubmit: function(e) {
            var obj = {}, name, self = this;
            for(var i in this.form_elements) {
                name = $(this.form_elements[i]).get_name();
                if(name !== null) {
                    obj[name] = $(this.form_elements[i]).get();
                }
            }
            obj.referer = '/' + this.Model.url + '/ajax/html';
            this.Model.ajax(
                $(this.submit_button).get_attribute(C$.link_name) + '/ajax/html',
                'onSubmitReturn',
                obj,
                this
            );
        },
        onSubmitReturn: function(json) {}
    };
    
    C$.inherit('CreasetophModel','').prototype = {
        base_url: '',
        ajax_navigation: true,
        hash: '',
        init: function() {
            this.set_base_url();
        },
        set_base_url: function() {
            this.base_url = window.location.href.substr(0,window.location.href.indexOf('/',8));
        },
        navigate: function(url) {
            if(this.ajax_navigation) {
                if(url.indexOf('/') === 0) {
                    url = url.substr(1);
                }
                url = url || 'home';
                this.hash = url;
                window.location.hash = url;
                this.set_query();
                if(this.query.length == 1) {
                    url = url + '/index';
                }
                this.url = url;
                this.ajax_ui(this.base_url + '/' + url + '/ajax/html',{'content':'.main_container_canvas'});
            }else {
                this.set_query();
                window.location = this.base_url + '/' + url;
            }
        },
        
        set_query: function() {
            this.query = window.location.href.substr(window.location.href.indexOf('/',8) + 1).split('/');
            this.query[0] = this.query[0].substr(1);
            if(this.query[0] === ''){
                this.query[0] = 'home';
            }
            return this.query;
        },
        poll_hash: function() {
            var self = creasetoph.CreasetophModel.prototype;
            if(window.location.hash.substr(1) === self.hash) {
                return;
            }
            self.hash = window.location.hash.substr(1);
            self.navigate(self.hash);
        },
        set_title: function(title_text) {
            document.title = title_text;
        },
        execute_scripts: function(el) {
            var scripts = el.getElementsByTagName('SCRIPT'),i,text,file,script_tag;
            if(scripts) {
                for(i in scripts) {
                    if(scripts[i] !== undefined) {
                        text = scripts[i].text;
                        file = scripts[i].file;
                        script_tag = document.createElement('SCRIPT');
                        if(file != null && file != '') {
                            script_tag.src = file;
                        }
                        script_tag.text = text;
                        document.getElementsByTagName('HEAD')[0].appendChild(script_tag);
                    }
                }
            }
        },
        insert_ui: function(selector,text) {
            var el = $(selector);
            el.set(text);
            C$.bind_controllers(el);
            C$.bind_forms(el);
            this.execute_scripts(el);
        },
        /*
        ui_obj = {
            'main': 'main_div'
        }
        json = {
            type   : 'html',
            title  : 'Creasetoph Home',
            insert_ui = {
                content: "djkfhgfasdkfjasgasdfas"
            }
        }
        */
        ajax_ui: function(url,ui_obj,post_vars,ret) {
            var self = this;
            var callback = function(json) {
                if(json.insert_ui !== undefined) {
                    for(var i in json.insert_ui) {
                        if(json.insert_ui.hasOwnProperty(i) && ui_obj[i]) {
                            self.insert_ui(ui_obj[i],json.insert_ui[i]);
                            if(json.title) {
                                self.set_title(json.title);
                            }
                        }
                    }
                }else {
                    self.insert_ui('.main_container',self.get_cache('json_error'));
                }
                if(typeof ret === 'function') {
                    ret(json);
                }
            };
            this.ajax(url,callback,post_vars);
        },
        ajax: function(url,callback,post_vars,scope) {
            C$.ajax(url,callback,post_vars,scope);
        },
        get_cache: function(name,return_el) {
            var ret = return_el || false;
            if(ret) {
                return $('.hidden_cache_container [cache=' + name + ']');
            }else {
                return $('.hidden_cache_container [cache=' + name + ']').innerHTML;
            }
        }
    };

    C$.inherit('CreasetophTextBase','CreasetophController').prototype = {
        default_value: '',
        Events: {
            'blur' : 'onBlur',
            'focus': 'onFocus',
            'keyup': 'onKeyUp'
        },
        onBind: function(el) {
            this.default_value = this.element.value;
        },
        onKeyUp: function(e) {
            creasetoph.SignInForm.prototype.validate();
        },
        onFocus: function(e) {
            if(!this.default_value) {
                this.default_value = e.controlled_by_element.value;
            }
            if(e.controlled_by_element.value == this.default_value) {
                e.controlled_by_element.title = e.controlled_by_element.value;
                e.controlled_by_element.value = '';
            }
            if(this.type) {
                e.controlled_by_element.type = this.type;
            }
        },
        onBlur: function(e) {
            if(e.controlled_by_element.value === ''){
                e.controlled_by_element.value = this.default_value;
                e.controlled_by_element.type = 'text';
            }
        }
    };

    C$.inherit('TextController','CreasetophTextBase').prototype = {
        singleton: false
    };

    C$.inherit('CreasetophLink','CreasetophController').prototype = {
        onClick: function(e) {
            var link = $(e.target_element).get_attribute(C$.link_name);
            if(link !== null) {
                this.Model.navigate(link);
            }
        }
    };

    C$.inherit('CreasetophJsonLink','CreasetophLink').prototype = {
        onClick: function(e) {
            var obj = {};
            obj.referer = '/' + this.Model.url + '/ajax/html';
            this.Model.ajax(
                $(e.originalTarget).get_attribute(C$.link_name) + '/ajax/html',
                'onReturn',
                obj,
                this
            );
        },
        onReturn: function(json) {}
    };

    C$.inherit('Animation','').prototype = {
        //Override these properties for animation
        properties: {},
        time: 2000,
        callback: function(){},
        //These are private
        onStop: null,
        instance: [],
        element: null,
        instance_count: 0,
        animation_attribute: 'animationId',
        add_animation_id: function(el) {
            $(el).set_attribute(this.animation_attribute, this.instance_count);
            this.instance_count++;
            return this.instance_count - 1;
        },
        get_animation_id: function(el) {
            var att = $(el).get_attribute(this.animation_attribute);
            if(att == null) {
                return this.add_animation_id(el);
            }else {
                return att;
            }
        },
        set_up: function(el) {
            var id = this.get_animation_id(el);
            return this.get_instance(id,el);
        },
        get_instance: function(index,el) {
            if(this.instance[index] == null) {
                this.instance[index] = C$.animation(this,el);
                return this.instance[index];
            }else {
                return this.instance[index];
            }
        },
        stop: function(el,func) {
            el = el || this.element;
            this.set_up(el).stop();
        },
        play: function(el) {
            el = el || this.element;
            this.set_up(el).play();
        },
        forward: function(el) {
            el = el || this.element;
            this.set_up(el).forward();
        },
        backward: function(el) {
            el = el || this.element;
            this.set_up(el).backward();
        },
        toggle: function(el){
            el = el || this.element;
            this.set_up(el).toggle();
        },
        onEnd: function() {
            if(typeof this.onStop == 'function') {
                this.onStop();
                this.onStop = null;
            }
            if(typeof this.callback == 'function') {
                this.callback();
            }
        },
        kill_instances: function() {
            this.instance = [];
        }
    };

})();
