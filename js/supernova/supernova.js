const SUPERNOVA = {
    reset(force=false, chal=false, post=false, fermion=false) {
        if (!chal && !post && !fermion) if ((force && player.confirms.sn)?!confirm("您确定要在未成为超新星的前提下重置吗？"):false) return
        if (tmp.supernova.reached || force || fermion) {
            tmp.el.supernova_scene.setDisplay(false)
            if (!force && !fermion) {
                player.supernova.times = player.supernova.post_10 ? player.supernova.times.max(tmp.supernova.bulk) : player.supernova.times.add(1)
            }
            if (post?!hasTree("qu_qol4"):true) {
                tmp.pass = true
                this.doReset()
            }
        }
    },
    doReset() {
        let br = player.qu.rip.active
        tmp.supernova.time = 0

        player.atom.points = E(0)
        player.atom.quarks = E(0)
        player.atom.particles = [E(0),E(0),E(0)]
        player.atom.powers = [E(0),E(0),E(0)]
        player.atom.atomic = E(0)
        player.atom.gamma_ray = E(0)
        
        let list_keep = [2,5,16]
        if (hasTree("qol2")) list_keep.push(6)
        let keep = []
        for (let x = 0; x < player.mainUpg.atom.length; x++) if (list_keep.includes(player.mainUpg.atom[x])) keep.push(player.mainUpg.atom[x])
		if (player.mainUpg.exotic.includes(19))keep = player.mainUpg.atom
		player.mainUpg.atom = keep
		
        list_keep = [21,36]
        if (player.mainUpg.br.includes(1)) list_keep.push(1)
        if (hasTree("qol1")) list_keep.push(14,18)
        if (hasTree("qol2")) list_keep.push(24)
        if (hasTree("qol3")) list_keep.push(43)
        if (quUnl()) list_keep.push(30)
        keep = []
        for (let x = 0; x < player.atom.elements.length; x++) if (list_keep.includes(player.atom.elements[x]) || player.atom.elements[x] > 86) keep.push(player.atom.elements[x])
        if(player.superGal.lt(8))player.atom.elements = keep
        if (hasTree("qu_qol9") && QCs.active() && !player.atom.elements.includes(84)) player.atom.elements.push(84)

        player.md.active = false
        player.md.particles = E(0)
        player.md.mass = E(0)
        for (let x = 0; x < MASS_DILATION.upgs.ids.length; x++) player.md.upgs[x] = E(0)

        player.stars.unls = 0
        player.stars.generators = [E(0),E(0),E(0),E(0),E(0)]
        player.stars.points = E(0)
        player.stars.boost = E(0)

        if (!hasTree("chal3")) for (let x = 5; x <= 8; x++) player.chal.comps[x] = E(0)

        ATOM.doReset()

        player.supernova.chal.noTick = true
        player.supernova.chal.noBHC = true

        tmp.pass = false
    },
    starGain() {
        let x = E(hasTree("c")?0.1:0)
        if (hasTree("sn1")) x = x.mul(tmp.supernova.tree_eff.sn1)
        if (hasTree("sn2")) x = x.mul(tmp.supernova.tree_eff.sn2)
        if (hasTree("sn3")) x = x.mul(tmp.supernova.tree_eff.sn3)
        if (hasTree("bs3")) x = x.mul(tmp.supernova.tree_eff.bs3)
        if (hasTree("sn5")) x = x.mul(tmp.supernova.tree_eff.sn5)
        if (tmp.qu.mil_reached[6]) x = x.mul(E(1.2).pow(player.qu.times).min(1e10))
        x = x.mul(tmp.radiation.bs.eff[11])
		x = x.mul(SUPERNOVA_GALAXY.effects.nsMult())
        if (hasTree("sn6")) x = x.pow(tmp.supernova.tree_eff.sn6)
		x = x.pow(SUPERNOVA_GALAXY.effects.ns())
	
		
			if(hasUpgrade('exotic',20) && x.gte(10))x = expMult(x,tmp.ex.exb_eff[4])
			if(hasTree('qp13') && x.gte(10))x = expMult(x,1.1)
				if(hasTree('qp33') && x.gte(10))x = expMult(x,treeEff('qp31'))
	
	if(player.gc.active || player.chal.active >= 21 || player.exotic.dark_run.active)x = GCeffect(x)
        return x
    },
    req(x=player.supernova.times) {
        ml_fp = E(1).mul(tmp.bosons.upgs.gluon[3].effect)
        maxlimit = E(1e20).pow(x.scaleEvery('supernova').div(ml_fp).pow(1.25)).mul(1e90)
		if(hasElement(555))maxlimit = E(1.1).pow(x.scaleEvery('supernova').div(ml_fp)).mul(100)
        bulk = E(0)
        if (player.stars.points.div(1e90).gte(1)) bulk = player.stars.points.div(1e90).max(1).log(1e20).max(0).root(1.25).mul(ml_fp).scaleEvery('supernova',true).add(1).floor().min(hasElement(291)?EINF:SUPERNOVA_GALAXY.req())
		if(hasElement(555)){
			bulk = E(0)
            if (player.stars.points.div(100).gte(1)) bulk = player.stars.points.div(100).max(1).log(1.1).max(0).mul(ml_fp).scaleEvery('supernova',true).add(1).floor()
		}
        return {maxlimit: maxlimit, bulk: bulk}
    },
}

function calcSupernova(dt, dt_offline) {
    let du_gs = tmp.preQUGlobalSpeed.mul(dt)
    let su = player.supernova

    if (player.tickspeed.gte(1)) su.chal.noTick = false
    if (player.bh.condenser.gte(1)) su.chal.noBHC = false

    if (tmp.supernova.reached && (!tmp.offlineActive || su.times.gte(1)) && !su.post_10) {
        if (su.times.lte(0)) tmp.supernova.time += dt
        else {
            addNotify("You become Supernova!")
            SUPERNOVA.reset()
        }
    }
    if (su.times.gte(1) || quUnl()) su.stars = su.stars.add(tmp.supernova.star_gain.mul(dt_offline).mul(tmp.preQUGlobalSpeed))

    if (!su.post_10 && su.times.gte(10)) {
        su.post_10 = true
        addPopup(POPUP_GROUPS.supernova10)
    }

    if (su.post_10) for (let x in BOSONS.names) {
        let id = BOSONS.names[x]
        su.bosons[id] = su.bosons[id].add(tmp.bosons.gain[id].mul(du_gs))
    }

    if (su.fermions.unl) {
        if (tmp.fermions.ch[0] >= 0) {
            su.fermions.tiers[tmp.fermions.ch[0]][tmp.fermions.ch[1]] = su.fermions.tiers[tmp.fermions.ch[0]][tmp.fermions.ch[1]]
            .max(tmp.fermions.tiers[tmp.fermions.ch[0]][tmp.fermions.ch[1]])
			if(tmp.fermions.ch[0] >= 2)
				su.fermions.tiers[tmp.fermions.ch[0]-2][tmp.fermions.ch[1]] = su.fermions.tiers[tmp.fermions.ch[0]-2][tmp.fermions.ch[1]]
				.max(tmp.fermions.tiers[tmp.fermions.ch[0]-2][tmp.fermions.ch[1]])
			
        } else if (hasTree("qu_qol8") && !(!hasTree("qu_qol8a")&&QCs.active())) for (let i = 0; i < 2; i++) for (let j = 0; j < 6; j++) if (j < FERMIONS.getUnlLength()) {
            su.fermions.tiers[i][j] = su.fermions.tiers[i][j]
            .max(tmp.fermions.tiers[i][j])
        }
        for (let x = 0; x < 2; x++) su.fermions.points[x] = su.fermions.points[x].add(tmp.fermions.gains[x].mul(du_gs))
    }

    if (tmp.radiation.unl) {
        if (!player.qu.en.eth[0]) su.radiation.hz = su.radiation.hz.add(tmp.radiation.hz_gain.mul(du_gs))
        for (let x = 0; x < RAD_LEN; x++) su.radiation.ds[x] = su.radiation.ds[x].add(tmp.radiation.ds_gain[x].mul(du_gs))
    }
}

function updateSupernovaTemp() {
    let req_data = SUPERNOVA.req()
    tmp.supernova.maxlimit = req_data.maxlimit
    tmp.supernova.bulk = req_data.bulk

    tmp.supernova.reached = tmp.stars?player.stars.points.gte(tmp.supernova.maxlimit):false;

    for (let i = 0; i < TREE_TAB.length; i++) {
        tmp.supernova.tree_afford2[i] = []
        for (let j = 0; j < tmp.supernova.tree_had2[i].length; j++) {
            let id = tmp.supernova.tree_had2[i][j]
            let t = TREE_UPGS.ids[id]

            let branch = t.branch||""
            let unl = (t.unl?t.unl():true)
            let req = t.req?t.req():true
            if (tmp.qu.mil_reached[1] && NO_REQ_QU.includes(id)) req = true
            if (player.superGal.gte(2)) req = true
            let can = (t.ax?EXOTIC.axsRem():t.qf?player.qu.points:player.supernova.stars).gte(t.cost) && !hasTree(id) && req
            if (branch != "") for (let x = 0; x < branch.length; x++) if (!hasTree(branch[x])) {
                unl = false
                can = false
                break
            }
            tmp.supernova.tree_unlocked[id] = unl || hasTree(id)
            tmp.supernova.tree_afford[id] = can
            if (can && unl) tmp.supernova.tree_afford2[i].push(id)
            if (t.effect) {
                tmp.supernova.tree_eff[id] = t.effect()
            }
        }
    }

    tmp.supernova.star_gain = SUPERNOVA.starGain()
}

function updateSupernovaEndingHTML() {
    if (tmp.supernova.reached && !tmp.offlineActive && player.supernova.times.lte(0) && !player.supernova.post_10) {
        tmp.tab = 5
        document.body.style.backgroundColor = `hsl(0, 0%, ${7-Math.min(tmp.supernova.time/4,1)*7}%)`
        tmp.el.supernova_scene.setDisplay(tmp.supernova.time>4)
        tmp.el.sns1.setOpacity(Math.max(Math.min(tmp.supernova.time-4,1),0))
        tmp.el.sns2.setOpacity(Math.max(Math.min(tmp.supernova.time-7,1),0))
        tmp.el.sns3.setOpacity(Math.max(Math.min(tmp.supernova.time-10,1),0))
        tmp.el.sns4.setOpacity(Math.max(Math.min(tmp.supernova.time-14,1),0))
        tmp.el.sns5.setVisible(tmp.supernova.time>17)
        tmp.el.sns5.setOpacity(Math.max(Math.min(tmp.supernova.time-17,1),0))
    }
    if ((player.supernova.times.lte(0)?!tmp.supernova.reached:true) || quUnl())document.body.style.backgroundColor = tmp.tab == 5 ? "#000" : "#111"

    tmp.el.app_supernova.setDisplay((player.supernova.times.lte(0) && !tmp.supernova.reached ? !tmp.supernova.reached : true) && tmp.tab == 5)

    if (tmp.tab == 5) {
        tmp.el.supernova_scale.setTxt(getScalingName('supernova'))
        tmp.el.supernova_rank.setTxt(format(player.supernova.times,0))
        tmp.el.supernova_next.setTxt("Next Supernova at "+format(tmp.supernova.maxlimit,2)+" stars")
		if (player.supernova.times.gte(SUPERNOVA_GALAXY.req()) && !hasElement(291)) tmp.el.supernova_next.setTxt("You reached the maximum Supernova limit!")
        if (tmp.stab[5] == 0) {
            updateTreeHTML()
        }
        if (tmp.stab[5] == 1) updateBosonsHTML()
        if (tmp.stab[5] == 2) updateFermionsHTML()
        if (tmp.stab[5] == 3) updateRadiationHTML()
        if (tmp.stab[5] == 4) updateSupernovaGalaxyHTML()
        if (tmp.stab[5] == 5) updateFermionsHTML()
        if (tmp.stab[5] == 6) updateSupernovaGalaxyHTML()
    }
}