var Q = require('qq'),
    PATH = require('path'),
    FS = require('fs'),
    CP = require('child_process'),
    UTIL = require('util'),
    bemUTIL = require('bem/lib/util'),
    extend = bemUTIL.extend,
    BEM = require('bem').api,
    createLevel = require('bem/lib/level').createLevel;

require('coa').Cmd()
    .name(PATH.basename(process.argv[1]))
    .title('GNUmakefile generator.')
    .helpful()
    .opt()
        .name('version').title('Show version')
        .short('v').long('version')
        .flag()
        .only()
        .act(function() {
            return JSON.parse(require('fs').readFileSync(
                PATH.join(__dirname, '..', 'package.json')))
                    .version;
        })
        .end()
    .opt()
        .name('output').title('Output file (default: stdout)')
        .short('o').long('output')
        .output()
        .end()
    .opt()
        .name('prjLevel').short('p').long('projectLevel')
        .title('project level, cwd by default')
        .def(process.cwd())
        .val(function (l) { return typeof l == 'string'? createLevel(l) : l })
        .end()
    .act(function(opts, args) {
        var prjLevelPath = opts.prjLevel.dir,
            blocksLevel = createLevel(PATH.join(prjLevelPath, 'blocks')),
            pagesLevel = createLevel(PATH.join(prjLevelPath, 'pages')),
            defer = Q.defer();

        defer.resolve();

        return defer.promise
            .then(function(res) {
                return BEM.create.block(
                    { forceTech: 'introspection', levelDir: blocksLevel.dir },
                    { names: 'ALL' })
            })
            .then(function() {
                return [
                    '.PHONY:',
                    'all: ' +
                        buildBlocksPrerequisits(prjLevelPath, blocksLevel) +
                        ' ' +
                        buildPagesPrerequisits(prjLevelPath, pagesLevel),
                    '',
                    buildBlocksTargets(prjLevelPath, blocksLevel),
                    buildPagesTargets(prjLevelPath, pagesLevel),
                    ''
                ]
            })
            .then(function(res) {
                var output = opts.output;
                output.write(res.join('\n'));
                output === process.stdout ? output.write('\n') : output.end();
            });
    })
    .run();

function buildBlocksPrerequisits(prjLevelPath, blocksLevel) {
    var res = [];

    forEachLevelAllTechs(
        prjLevelPath,
        blocksLevel,
        function() { res.push(PATH.join('blocks', PATH.basename(this.path))) })

    return res.join(' ');
}

function buildPagesPrerequisits(prjLevelPath, pagesLevel) {
    var res = [];

    forEachPageTechs(
        prjLevelPath,
        pagesLevel,
        function() { res.push(this.path + '.html') });

    return res.join(' ');
}


function buildBlocksTargets(prjLevelPath, blocksLevel) {
    var res = [];

    forEachLevelAllTechs(prjLevelPath, blocksLevel, function() {
        res.push([
            PATH.join('blocks', PATH.basename(this.path)) + ': ' +
                buildIntrospectionPrerequisits.call(this),
            '\tbem build' +
                ' -t ' + this.tech.getTechName() +
                ' -o $(@D) -n $(basename $(@F))' +
                ' -d ' + prjRelTechPath.call(extend(this, { suffix: 'introspection' })) +
                ' -l ' + prjRelLevelPath.call(this),
            ({
                'scss': '\tsass --scss $@ $(addsuffix .css,$(basename $@))',

                'coffee': '\tcoffee -c $@'
            })[this.tech.getTechName()] || '',
            ''
        ].join('\n'))
    });

    return res.join('\n');
}

function buildPagesTargets(prjLevelPath, pagesLevel) {
    var res = [];

    forEachPageTechs(prjLevelPath, pagesLevel, function() {
        this.suffix == 'haml' &&
            res.push([
                this.path + '.html: ' + this.path + '.ALL',
                '\thaml -r .bem/bem-haml.rb $< $@',
                '',
                this.path + '.ALL: blocks/ALL.haml ' + this.path,
                '\tcat $^ > $@',
                ''
            ].join('\n'))
    });

    return res.join('\n');
}

function forEachPageTechs(prjLevelPath, pagesLevel, fn) {
    pagesLevel.getDeclByIntrospection().forEach(function(p) {
        var prefix = pagesLevel.get('block', [p.name]);
        forEachLevelTechs(pagesLevel, function() {
            fn.call({
                root: prjLevelPath,
                level: pagesLevel,
                tech: this.tech,
                suffix: this.suffix,
                prefix: prefix,
                path: PATH.relative(prjLevelPath,
                    this.tech.getPath(prefix, this.suffix))
            })
        })
    });
}

function forEachLevelAllTechs(prjLevelPath, blocksLevel, fn) {
    var prefix = blocksLevel.get('block', ['ALL']);

    forEachLevelTechs(blocksLevel, function() {
        fn.call({
            root: prjLevelPath,
            level: blocksLevel,
            tech: this.tech,
            suffix: this.suffix,
            prefix: prefix,
            path: PATH.relative(prjLevelPath,
                this.tech.getPath(prefix, this.suffix))
        })
    });
}

function forEachLevelTechs(level, fn) {
    var techs = level.getTechs();
    for(var t in techs) {
        t = level.getTech(t);
        t.getSuffixes().forEach(function(suffix) {
            fn.call({ level: level, tech: t, suffix: suffix })
        })
    }
}

function buildIntrospectionPrerequisits() {
    var introspectionPath = prjRelTechPath.call(extend(this, { suffix: this.suffix + '.introspection' }));

    if(PATH.existsSync(introspectionPath)) {
        var res = [introspectionPath],
            _this = this;

        String(FS.readFileSync(introspectionPath)).split('\n').forEach(function(f) {
            f && f.indexOf('ALL') && res.push(prjRelPath.call(_this, PATH.join(_this.prefix, '..', f)))
        });

        return res.join(' ')
    }

    return ''
}

function prjRelLevelPath() {
    return PATH.relative(this.root, this.level.dir)
}

function prjRelTechPath() {
    return PATH.relative(this.root, this.tech.getPath(this.prefix, this.suffix))
}

function prjRelPath(to) {
    return PATH.relative(this.root, to)
}

