/**
 * @fileoverview 运行测试用例
 * @author 剑平（明河）<minghe36@gmail.com>
 **/
KISSY.add(function (S, Base, Node) {
    function runner(){
        var env = jasmine.getEnv();
        env.addReporter(new jasmine.HtmlReporter);
        env.execute();
    }
    return runner;
},{requires:['base', 'node','spec/uploader/queue-spec']});