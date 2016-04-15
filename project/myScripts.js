var FOO = (function() {

    // using the YUI module pattern, I can have safe global variables
    // and still call functions outside the module easily
    // the global variables will be character stats like AC, cmb, etc

    // ability scores global var to preserve classic ability score's 'roll'
    "use strict";
    var strength = 0;
    var dexterity = 0;
    var constitution = 0;
    var wisdom = 0;
    var intelligence = 0;
    var charisma = 0;

    /* ability score modifiers
        scores above 11 get a positive mod
        scores below 10 get a negative mod
        will be calculated when ability scores are
        set, accounting for pos and neg mods */

    var strMod = 0;
    var dexMod = 0;
    var conMod = 0;
    var wisMod = 0;
    var intMod = 0;
    var chaMod = 0;

    var name;
    var gender;
    var alignment;
    var race = null;
    var charClass = null;
    var ac = 10;  // or armor class. base score is 10
    var touch = 10; // touch ac, score is 10 (base) + dex mod
    var cmb = 0; // combat manuever bonus
    var cmd = 10; // combat manuever defense, base score is 10
    var bab = 0; // base attack bonus
    localStorage.setItem("bab", bab); // for classes with no 1st lvl bab increase
    var fort; // fortitude save
    var ref; // reflex save
    var will; // will save
    var hp; // hit points
    var size = "medium"; // will only change if appropriate race is picked
    var speed = 30; // change when needed
    localStorage.setItem("speed", speed); // for races with no speed change
    var langs; // languages known
    var inititiative = 0;
    var spec; // wizard specialist school
    var banned = []; // wizard 'banned' schools

    /* these vars will hold string lists
        of situational and other
        racial/class traits that the character
        has */

    var defensiveTraits;
    var offensiveTraits;
    var sensesTraits;
    var skillTraits;
    var magicalTraits;
    var otherTraits;
    var classAbilities;
    var spells = [];

    // total feats based on race, class, etc
    // and list of chosen feats
    var totalFeats = 1;
    var featList = [];

    // total skill points based on int, race, class, etc
    var totalSkillPoints = 0;

    /* these are skil variables
         they will be updated as skill points are added
         using objects allows me to
         differentiate added ranks
         from misc. bonuses */
    var Acrobatics = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Appraise = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Bluff = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Climb = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Craft = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Diplomacy = {ranks: 0, misc: 0, mod: 0, total: 0};
    var DisableDevice = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Disguise = {ranks: 0, misc: 0, mod: 0, total: 0};
    var EscapeArtist = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Fly = {ranks: 0, misc: 0, mod: 0, total: 0};
    var HandleAnimal = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Heal = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Intimidate = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Arcana = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Dungeoneering = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Engineering = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Geography = {ranks: 0, misc: 0, mod: 0, total: 0};
    var History = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Local = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Nature = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Nobility = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Planes = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Religion = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Linguistics = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Perception = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Perform = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Profession = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Ride = {ranks: 0, misc: 0, mod: 0, total: 0};
    var SenseMotive = {ranks: 0, misc: 0, mod: 0, total: 0};
    var SleightOfHand = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Spellcraft = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Stealth = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Survival = {ranks: 0, misc: 0, mod: 0, total: 0};
    var Swim = {ranks: 0, misc: 0, mod: 0, total: 0};
    var UseMagicDevice = {ranks: 0, misc: 0, mod: 0, total: 0};


    // private methods of FOO
        function roll(x) {
        /* 'rolls' an x sided die, essential for determining ability scores, hp, etc */
            return (Math.floor(Math.random() * x) + 1);
        }

        function sum(lst) {
            /* helper for standard function
                sums all elements in the filtered list */

            var total = 0;
            var i;
            for (i = 0; i < lst.length; i += 1) {
                total += lst[i];
            }

            return total;

        }

        function classic() {
            /* generates a single classic ability score,
                three nums from 1 - 6 added together
                */

                return  roll(6) + roll(6) + roll(6);

        }

        function  standard() {

            /* the standard method for generating ability scores
                rolls 4d6 and drops the minimum result by sorting
                and then slicing the array
                */

                var x = [roll(6), roll(6), roll(6), roll(6)];
                x = x.sort();
                x = x.slice(1);

                return sum(x);

        }

        function heroic() {

        /* heroic ability scores are 2d6 + 6 */

            return roll(6) + roll(6) + 6;

        }

        return {
            /* first the functions that
            will be used to generate 
            a new char. picking alignment
            and gender*/
        newChar: function() {
            location.assign('/home/luke/seniorProject/main/responsive-tabs/nameAndAlignment.html');
        },

        startCreation: function() {
            location.assign('/home/luke/seniorProject/main/responsive-tabs/index.html');
        },

        setAlignment: function(a) {
            alignment = a;
            localStorage.setItem("alignment", alignment);
        },

        setGender: function(g) {
            gender = g;
            localStorage.setItem("gender", gender);
        },
        // public methods of FOO
        addFort: function(x) {
            // increments fort save by x
            fort += x;
        },

        addRef: function(x) {
            // increments reflex save by x
            ref += x;
        },

        addWill: function(x) {
            // incremtns will save by x
            will += x;
        },

        dispFeats: function() {
            /* will display number of
                feats available to user
                and update as feats
                are selected */
            document.getElementById("num-of-feats").innerHTML = totalFeats;
        },

        dispSkills: function() {
            /* will dipslay number of skill points
                available to user as skills and
                will update as skills are chosen */
            document.getElementById("num-of-skills").innerHTML = totalSkillPoints;
        },

        /* setters for ability scores
            changes score, modifier
            and skills affected by given score */

        setStr: function(x) {
            /*sets str score and derived attributes*/

            strength = x;
            strMod = Math.floor((strength/2) - 5);

            Climb.mod = strMod;
            Swim.mod = strMod;
            cmb += strMod;

            localStorage.setItem("cmb", cmb);
            localStorage.setItem("strength", strength);
            localStorage.setItem("strMod", strMod);
            localStorage.setItem("Climb", Climb.mod);
            localStorage.setItem("Swim", Swim.mod);

        },

        setDex: function(x) {
            /*sets dex and derived attributes*/
            dexterity = x;
            dexMod = Math.floor((dexterity/2) - 5);

            ref = dexMod; // reflex save
            ac += dexMod; // dex bonus to ac
            touch += dexMod; // and touch ac
            inititiative = dexMod;
            cmd += dexMod;

            Acrobatics.mod = dexMod;
            DisableDevice.mod = dexMod;
            EscapeArtist.mod = dexMod;
            Fly.mod = dexMod;
            Ride.mod = dexMod;
            SleightOfHand.mod = dexMod;
            Stealth.mod = dexMod;

            localStorage.setItem("dexterity", dexterity);
            localStorage.setItem("dexMod", dexMod);
            localStorage.setItem("inititiative", inititiative);
            localStorage.setItem("ref", ref);
            localStorage.setItem("ac", ac);
            localStorage.setItem("touch", touch);
            localStorage.setItem("cmd", cmd);

            localStorage.setItem("Acrobatics", Acrobatics.mod);
            localStorage.setItem("DisableDevice", DisableDevice.mod);
            localStorage.setItem("EscapeArtist", EscapeArtist.mod);
            localStorage.setItem("Fly", Fly.mod);
            localStorage.setItem("Ride", Ride.mod);
            localStorage.setItem("SleightOfHand", SleightOfHand.mod);
            localStorage.setItem("Stealth", Stealth.mod);

        },

        setCon: function(x) {
            /*sets con and derived attributes*/
            constitution = x;
            conMod = Math.floor((constitution/2) - 5);

            fort = conMod; // fortitude save
            hp = conMod; // con hp bonus

            localStorage.setItem("constitution", constitution);
            localStorage.setItem("conMod", conMod);
            localStorage.setItem("fort", fort);

        },

        setWis: function(x) {
            /*sets wis and derived attributes*/
            wisdom = x;
            wisMod = Math.floor((wisdom/2) - 5);

            will = wisMod; // will save

            Heal.mod = wisMod;
            Perception.mod = wisMod;
            Profession.mod = wisMod;
            SenseMotive.mod = wisMod;
            Survival.mod = wisMod;

            localStorage.setItem("wisdom", wisdom);
            localStorage.setItem("wisMod", wisMod);
            localStorage.setItem("will", will);
            localStorage.setItem("Heal", Heal.mod);
            localStorage.setItem("Perception", Perception.mod);
            localStorage.setItem("Profession", Profession.mod);
            localStorage.setItem("Profession", Profession.mod);
            localStorage.setItem("SenseMotive", SenseMotive.mod);
            localStorage.setItem("Survival", Survival.mod);

        },

        setInt: function(x) {
            /*sets int and derived attributes*/
            intelligence = x;
            intMod = Math.floor((intelligence/2) - 5);
            /* skill points only change when int changes
                putting it here will work when any race that
                can get int bonus is picked */
           totalSkillPoints = intMod;
            FOO.dispSkills();

            Appraise.mod = intMod;
            Craft.mod = intMod;
            Linguistics.mod = intMod;
            Spellcraft.mod = intMod;
            Arcana.mod = intMod;
            Dungeoneering.mod = intMod;
            Engineering.mod = intMod;
            Geography.mod = intMod;
            History.mod = intMod;
            Local.mod = intMod;
            Nature.mod = intMod;
            Nobility.mod = intMod;
            Planes.mod = intMod;
            Religion.mod = intMod;

            localStorage.setItem("intelligence", intelligence);
            localStorage.setItem("intMod", intMod);

            localStorage.setItem("Appraise", Appraise.mod);
            localStorage.setItem("Craft", Craft.mod);
            localStorage.setItem("Arcana", Arcana.mod);
            localStorage.setItem("Dungeoneering", Dungeoneering.mod);
            localStorage.setItem("Engineering", Engineering.mod);
            localStorage.setItem("Geography", Geography.mod);
            localStorage.setItem("History", History.mod);
            localStorage.setItem("Local", Local.mod);
            localStorage.setItem("Nature", Nature.mod);
            localStorage.setItem("Nobility", Nobility.mod);
            localStorage.setItem("Planes", Planes.mod);
            localStorage.setItem("Religion", Religion.mod);
            localStorage.setItem("Linguistics", Linguistics.mod);
            localStorage.setItem("Spellcraft", Spellcraft.mod);

        },

        setCha: function(x) {
            /*sets cha and derived attributes*/
            charisma = x;
            chaMod = Math.floor((charisma/2) - 5);

            Bluff.mod = chaMod;
            Diplomacy.mod = chaMod;
            Disguise.mod = chaMod;
            HandleAnimal.mod = chaMod;
            Intimidate.mod = chaMod;
            Perform.mod = chaMod;
            UseMagicDevice.mod = chaMod;

            localStorage.setItem("charisma", charisma);
            localStorage.setItem("chaMod", chaMod);

            localStorage.setItem("Bluff", Bluff.mod);
            localStorage.setItem("Diplomacy", Diplomacy.mod);
            localStorage.setItem("Disguise", Disguise.mod);
            localStorage.setItem("HandleAnimal", HandleAnimal.mod);
            localStorage.setItem("Intimidate", Intimidate.mod);
            localStorage.setItem("Perform", Perform.mod);
            localStorage.setItem("UseMagicDevice", UseMagicDevice.mod);

        },

        genScoresClassic: function() {

            /* retruns a list of six classic style ability scores
                in order they are str dex con wis int and cha
                */
            var str = classic();
            var dex = classic();
            var con = classic();
            var int = classic();
            var wis = classic();
            var cha = classic();

            FOO.setStr(str);
            FOO.setDex(dex);
            FOO.setCon(con);
            FOO.setInt(int);
            FOO.setWis(wis);
            FOO.setCha(cha);

            document.getElementById("str").innerHTML = "Str: " + strength + " (" + strMod + ")";
            document.getElementById("dex").innerHTML = "Dex: " + dexterity + " (" + dexMod + ")";
            document.getElementById("con").innerHTML = "Con: " + constitution + " (" + conMod + ")";
            document.getElementById("int").innerHTML = "Int: " + intelligence + " (" + intMod + ")";
            document.getElementById("wis").innerHTML = "Wis: " + wisdom + " (" + wisMod + ")";
            document.getElementById("cha").innerHTML = "Cha: " + charisma + " (" + chaMod + ")";

        },

        genScoresStandard: function() {

            var a1 = standard();
            var a2 = standard();
            var a3 = standard();
            var a4 = standard();
            var a5 = standard();
            var a6 = standard();

            // generic radio buttons
            var rad1 = '<input type="radio" name="rad1" ';
            var rad2 = '<input type="radio" name="rad2" ';
            var rad3 = '<input type="radio" name="rad3" ';
            var rad4 = '<input type="radio" name="rad4" ';
            var rad5 = '<input type="radio" name="rad5" ';
            var rad6 = '<input type="radio" name="rad6" ';


            /*now make a bunch of radio buttons
                the str radio buttons set strength
                dex sets dex, and so on*/
            var str1 = rad1 + 'onclick="FOO.setStr(' + a1 + ')" >' + a1;
            var str2 = rad1 + 'onclick="FOO.setStr(' + a2 + ')" >' + a2;
            var str3 = rad1 + 'onclick="FOO.setStr(' + a3 + ')" >' + a3;
            var str4 = rad1 + 'onclick="FOO.setStr(' + a4 + ')" >' + a4;
            var str5 = rad1 + 'onclick="FOO.setStr(' + a5 + ')" >' + a5;
            var str6 = rad1 + 'onclick="FOO.setStr(' + a6 + ')" >' + a6;

            var dex1 = rad2 + 'onclick="FOO.setDex(' + a1 + ')" >' + a1;
            var dex2 = rad2 + 'onclick="FOO.setDex(' + a2 + ')" >' + a2;
            var dex3 = rad2 + 'onclick="FOO.setDex(' + a3 + ')" >' + a3;
            var dex4 = rad2 + 'onclick="FOO.setDex(' + a4 + ')" >' + a4;
            var dex5 = rad2 + 'onclick="FOO.setDex(' + a5 + ')" >' + a5;
            var dex6 = rad2 + 'onclick="FOO.setDex(' + a6 + ')" >' + a6;

            var con1 = rad3 + 'onclick="FOO.setCon(' + a1 + ')" >' + a1;
            var con2 = rad3 + 'onclick="FOO.setCon(' + a2 + ')" >' + a2;
            var con3 = rad3 + 'onclick="FOO.setCon(' + a3 + ')" >' + a3;
            var con4 = rad3 + 'onclick="FOO.setCon(' + a4 + ')" >' + a4;
            var con5 = rad3 + 'onclick="FOO.setCon(' + a5 + ')" >' + a5;
            var con6 = rad3 + 'onclick="FOO.setCon(' + a6 + ')" >' + a6;

            var int1 = rad4 + 'onclick="FOO.setInt(' + a1 + ')" >' + a1;
            var int2 = rad4 + 'onclick="FOO.setInt(' + a2 + ')" >' + a2;
            var int3 = rad4 + 'onclick="FOO.setInt(' + a3 + ')" >' + a3;
            var int4 = rad4 + 'onclick="FOO.setInt(' + a4 + ')" >' + a4;
            var int5 = rad4 + 'onclick="FOO.setInt(' + a5 + ')" >' + a5;
            var int6 = rad4 + 'onclick="FOO.setInt(' + a6 + ')" >' + a6;

            var wis1 = rad5 + 'onclick="FOO.setWis(' + a1 + ')" >' + a1;
            var wis2 = rad5 + 'onclick="FOO.setWis(' + a2 + ')" >' + a2;
            var wis3 = rad5 + 'onclick="FOO.setWis(' + a3 + ')" >' + a3;
            var wis4 = rad5 + 'onclick="FOO.setWis(' + a4 + ')" >' + a4;
            var wis5 = rad5 + 'onclick="FOO.setWis(' + a5 + ')" >' + a5;
            var wis6 = rad5 + 'onclick="FOO.setWis(' + a6 + ')" >' + a6;

            var cha1 = rad6 + 'onclick="FOO.setCha(' + a1 + ')" >' + a1;
            var cha2 = rad6 + 'onclick="FOO.setCha(' + a2 + ')" >' + a2;
            var cha3 = rad6 + 'onclick="FOO.setCha(' + a3 + ')" >' + a3;
            var cha4 = rad6 + 'onclick="FOO.setCha(' + a4 + ')" >' + a4;
            var cha5 = rad6 + 'onclick="FOO.setCha(' + a5 + ')" >' + a5;
            var cha6 = rad6 + 'onclick="FOO.setCha(' + a6 + ')" >' + a6;
                                                          
            document.getElementById("str").innerHTML = "Str: " + str1 + str2 + str3 + str4 + str5 + str6;
            document.getElementById("dex").innerHTML = "Dex:" + dex1 + dex2 + dex3 + dex4 + dex5 + dex6;
            document.getElementById("con").innerHTML = "Con:" + con1 + con2 + con3 + con4 + con5 + con6;
            document.getElementById("int").innerHTML = "Int:" + int1 + int2 + int3 + int4 + int5 + int6;
            document.getElementById("wis").innerHTML = "Wis: " + wis1 + wis2 + wis3 + wis4 + wis5 + wis6;
            document.getElementById("cha").innerHTML = "Cha:" + cha1 + cha2 + cha3 + cha6 + cha6 + cha6;
        },

        genScoresHeroic: function() {

            var a1 = heroic();
            var a2 = heroic();
            var a3 = heroic();
            var a4 = heroic();
            var a5 = heroic();
            var a6 = heroic();

            // generic radio buttons
            var rad1 = '<input type="radio" name="rad1" ';
            var rad2 = '<input type="radio" name="rad2" ';
            var rad3 = '<input type="radio" name="rad3" ';
            var rad4 = '<input type="radio" name="rad4" ';
            var rad5 = '<input type="radio" name="rad5" ';
            var rad6 = '<input type="radio" name="rad6" ';


            /*now make a bunch of radio buttons
                the str radio buttons set strength
                dex sets dex, and so on*/
            var str1 = rad1 + 'onclick="FOO.setStr(' + a1 + ')" >' + a1;
            var str2 = rad1 + 'onclick="FOO.setStr(' + a2 + ')" >' + a2;
            var str3 = rad1 + 'onclick="FOO.setStr(' + a3 + ')" >' + a3;
            var str4 = rad1 + 'onclick="FOO.setStr(' + a4 + ')" >' + a4;
            var str5 = rad1 + 'onclick="FOO.setStr(' + a5 + ')" >' + a5;
            var str6 = rad1 + 'onclick="FOO.setStr(' + a6 + ')" >' + a6;

            var dex1 = rad2 + 'onclick="FOO.setDex(' + a1 + ')" >' + a1;
            var dex2 = rad2 + 'onclick="FOO.setDex(' + a2 + ')" >' + a2;
            var dex3 = rad2 + 'onclick="FOO.setDex(' + a3 + ')" >' + a3;
            var dex4 = rad2 + 'onclick="FOO.setDex(' + a4 + ')" >' + a4;
            var dex5 = rad2 + 'onclick="FOO.setDex(' + a5 + ')" >' + a5;
            var dex6 = rad2 + 'onclick="FOO.setDex(' + a6 + ')" >' + a6;

            var con1 = rad3 + 'onclick="FOO.setCon(' + a1 + ')" >' + a1;
            var con2 = rad3 + 'onclick="FOO.setCon(' + a2 + ')" >' + a2;
            var con3 = rad3 + 'onclick="FOO.setCon(' + a3 + ')" >' + a3;
            var con4 = rad3 + 'onclick="FOO.setCon(' + a4 + ')" >' + a4;
            var con5 = rad3 + 'onclick="FOO.setCon(' + a5 + ')" >' + a5;
            var con6 = rad3 + 'onclick="FOO.setCon(' + a6 + ')" >' + a6;
            
            var int1 = rad4 + 'onclick="FOO.setInt(' + a1 + ')" >' + a1;
            var int2 = rad4 + 'onclick="FOO.setInt(' + a2 + ')" >' + a2;
            var int3 = rad4 + 'onclick="FOO.setInt(' + a3 + ')" >' + a3;
            var int4 = rad4 + 'onclick="FOO.setInt(' + a4 + ')" >' + a4;
            var int5 = rad4 + 'onclick="FOO.setInt(' + a5 + ')" >' + a5;
            var int6 = rad4 + 'onclick="FOO.setInt(' + a6 + ')" >' + a6;

            var wis1 = rad5 + 'onclick="FOO.setWis(' + a1 + ')" >' + a1;
            var wis2 = rad5 + 'onclick="FOO.setWis(' + a2 + ')" >' + a2;
            var wis3 = rad5 + 'onclick="FOO.setWis(' + a3 + ')" >' + a3;
            var wis4 = rad5 + 'onclick="FOO.setWis(' + a4 + ')" >' + a4;
            var wis5 = rad5 + 'onclick="FOO.setWis(' + a5 + ')" >' + a5;
            var wis6 = rad5 + 'onclick="FOO.setWis(' + a6 + ')" >' + a6;

            var cha1 = rad6 + 'onclick="FOO.setCha(' + a1 + ')" >' + a1;
            var cha2 = rad6 + 'onclick="FOO.setCha(' + a2 + ')" >' + a2;
            var cha3 = rad6 + 'onclick="FOO.setCha(' + a3 + ')" >' + a3;
            var cha4 = rad6 + 'onclick="FOO.setCha(' + a4 + ')" >' + a4;
            var cha5 = rad6 + 'onclick="FOO.setCha(' + a5 + ')" >' + a5;
            var cha6 = rad6 + 'onclick="FOO.setCha(' + a6 + ')" >' + a6;
                                                          
            document.getElementById("str").innerHTML = "Str: " + str1 + str2 + str3 + str4 + str5 + str6;
            document.getElementById("dex").innerHTML = "Dex:" + dex1 + dex2 + dex3 + dex4 + dex5 + dex6;
            document.getElementById("con").innerHTML = "Con:" + con1 + con2 + con3 + con4 + con5 + con6;
            document.getElementById("int").innerHTML = "Int:" + int1 + int2 + int3 + int4 + int5 + int6;
            document.getElementById("wis").innerHTML = "Wis: " + wis1 + wis2 + wis3 + wis4 + wis5 + wis6;
            document.getElementById("cha").innerHTML = "Cha:" + cha1 + cha2 + cha3 + cha6 + cha6 + cha6;
        },

        pickDwarf: function() {
            FOO.setCon(constitution + 2);
            FOO.setWis(wisdom + 2);
            FOO.setCha(charisma - 2);
            race = "dwarf";
            localStorage.setItem("race", race);
            speed = 20;
            localStorage.setItem("speed", speed);
            langs = ["common", "dwarven"];
            localStorage.setItem("langs", langs);
            defensiveTraits = ["+4 AC vs giants",
                                          "+2 save vs poison, spells, spell-like abilities",
                                           "+4 CMD vs bull rush and trip while standing"];
            localStorage.setItem("defensiveTraits", defensiveTraits);
            offensiveTraits = ["+1 attack vs orc and goblinoid",
                                          "proficient with battleaxe, heavy pick, warhammer, and dwarven weapons"];
            localStorage.setItem("offensiveTraits", offensiveTraits);
            sensesTraits = "darkvision";
            localStorage.setItem("sensesTraits", sensesTraits);
            skillTraits = ["+2 appraise for non-magical goods containing precious metal or gemstones",
                                "+2 Perception for unusual stonework within 10' at all times"];
            localStorage.setItem("skillTraits", skillTraits);
        },

        pickElf: function() {
            FOO.setDex(dexterity + 2);
            FOO.setInt(intelligence + 2);
            FOO.setCon(constitution + 2);
            race = "elf";
            race = "dwarf";
            localStorage.setItem("race", race);
            langs = ["common", "elven"];
            localStorage.setItem("langs", langs);
            Perception.misc = 2; // racial bonus, all checks
            Perception.total = Perception.misc +Perception.mod;
            defensiveTraits = ["immune to sleep effects",
                                            "+2 saving throw vs enchantment"];
            magicalTraits = ["+2 caster level check to overcome spell resistance",
                                        "+2 spellcraft to id magic items"];
            offensiveTraits = ["proficient with longbow, longsword, rapier, shortbow, and elven weapons"];
            sensesTraits = "low-light vision";
        },

        pickHalfElf: function() {
            // implement chosen attr later
            race = "half-elf";
            localStorage.setItem("race", race);
            langs = ["common", "elven"];
            localStorage.setItem("langs", langs);
            featList = ["Skill Focus"];
            Perception.misc = 2; //same as elf
            Perception.total = Perception.misc +Perception.mod;
            defensiveTraits = ["immune to sleep effects",
                                            "+2 saving throw vs enchantment"];
            sensesTraits = "low-light vision";
            otherTraits = ["choose two favored classes", "count as elf and human for any effect related to race"];
            // we will dynamically generate the button to choose an attribute to add the bonus to
            var button1 = "<button onclick='FOO.setStr(" + (strength + 2) + ")'>Strength</button>";
            var button2 = "<button onclick='FOO.setDex(" + (dexterity + 2) + ")'>Dexterity</button>";
            var button3 = "<button onclick='FOO.setCon(" + (constitution + 2) + ")'>Constitution</button>";
            var button4 = "<button onclick='FOO.setWis(" + (wisdom + 2) + ")'>Wisdom</button>";
            var button5 = "<button onclick='FOO.setInt(" + (intelligence + 2) +")'>Intelligence</button>";
            var button6 = "<button onclick='FOO.setCha(" + (charisma + 2) +")'>Charisma</button>";
            var arr = [button1, button2, button3, button4, button5, button6];
            document.getElementById("half-elf-bonus").innerHTML = "Pick an attribute to add your + 2 bonus to<br>" + arr;

        },

        pickGnome: function() {
            FOO.setCon(constitution + 2);
            FOO.setCha(charisma + 2);
            FOO.setStr(strength - 2);
            race = "gnome";
            localStorage.setItem("race", race);
            size = "small";
            Stealth.misc = 4; //size bonus
            Stealth.total = Stealth.mod +Stealth.misc;
            ac -= 1; //size penalty
            cmb -= 1; // size penalty
            cmd -= 1; // size penalty
            localStorage.setItem("ac", ac);
            localStorage.setItem("cmb", cmb);
            localStorage.setItem("cmd", cmd);
            speed = 20;
            localStorage.setItem("speed", speed);
            langs = ["common", "gnome", "sylvan"];
            localStorage.setItem("langs", langs);
            Perception.misc = 2; // racial bonus, all checks
            // craft or profession + 2
            // spells if cha >= 11
            defensiveTraits = ["+4 AC vs giants",
                                          "+2 saving throw vs illusions"];
            magicalTraits = ["+1 DC to saving throws agains illusions cast",
                                        "Gnomes with Charisma scores of 11 or higher also gain the following spell-like abilities: 1/day—dancing lights, ghost sound, prestidigitation, and speak with animals. The caster level for these effects is equal to the gnome's level. The DC for these spells is equal to 10 + the spell's level + the gnome's Charisma modifier."];
            sensesTraits = "low-light vision";
            offensiveTraits = ["+1 attack vs reptillian and goblinoid",
                                        "proficient with gnome weapons"];

        },

        pickHalfOrc: function() {
            // choose a score
            race = "half-orc";
            localStorage.setItem("race", race);
            langs = ["common", "orc"];
            localStorage.setItem("langs", langs);
            Intimidate.misc = 2; // racial bonus, all checks
            Intimidate.total = Intimidate.misc + Intimidate.mod;
            sensesTraits = "darkvision";
            offensiveTraits = ["Can fight for 1 round as if disabled when brought below 0 hp",
                                            "proficient with greataxes, falchions, and orc weapons"];
            otherTraits = ["count as orcs and humans for any effects related to race"];
            var button1 = "<button onclick='FOO.setStr(" + (strength + 2) + ")'>Strength</button>";
            var button2 = "<button onclick='FOO.setDex(" + (dexterity + 2) + ")'>Dexterity</button>";
            var button3 = "<button onclick='FOO.setCon(" + (constitution + 2) + ")'>Constitution</button>";
            var button4 = "<button onclick='FOO.setWis(" + (wisdom + 2) + ")'>Wisdom</button>";
            var button5 = "<button onclick='FOO.setInt(" + (intelligence + 2) +")'>Intelligence</button>";
            var button6 = "<button onclick='FOO.setCha(" + (charisma + 2) +")'>Charisma</button>";
            var arr = [button1, button2, button3, button4, button5, button6];
            document.getElementById("half-orc-bonus").innerHTML = "Pick an attribute to add your + 2 bonus to<br>" + arr;
        },

        pickHalfling: function() {
            FOO.setDex(dexterity + 2);
            FOO.setCha(charisma + 2);
            FOO.setStr(strength - 2);
            race = "halfling";
            localStorage.setItem("race", race);
            size = "small";
            Stealth.misc = 4; // size bonus
            Stealth.total = Stealth.mod +Stealth.misc;
            ac -= 1; // size penalty
            cmb -= 1; // size penalty
            cmd -= 1; // size penalty
            localStorage.setItem("ac", ac);
            localStorage.setItem("cmb", cmb);
            localStorage.setItem("cmd", cmd);
            speed = 20;
            localStorage.setItem("speed", speed);
            langs = ["common", "halfling"];
            localStorage.setItem("langs", langs);
            fort += 1;
            ref += 1;
            will += 1; // all throws
            Acrobatics.misc = 2;
            Perception.misc = 2;
            Climb.misc = 2; // all checks
            defensiveTraits = ["+2 saving throws vs fear."];
            offensiveTraits = ["proficient with slings and halfling weapons"];
        },

        pickHuman: function() {
            // pick a score
            race = "human";
            localStorage.setItem("race", race);
            langs = ["common"];
            localStorage.setItem("langs", langs);
            totalFeats += 1;
            FOO.dispFeats();
            totalSkillPoints += 1;
            FOO.dispSkills();
            var button1 = "<button onclick='FOO.setStr(" + (strength + 2) + ")'>Strength</button>";
            var button2 = "<button onclick='FOO.setDex(" + (dexterity + 2) + ")'>Dexterity</button>";
            var button3 = "<button onclick='FOO.setCon(" + (constitution + 2) + ")'>Constitution</button>";
            var button4 = "<button onclick='FOO.setWis(" + (wisdom + 2) + ")'>Wisdom</button>";
            var button5 = "<button onclick='FOO.setInt(" + (intelligence + 2) +")'>Intelligence</button>";
            var button6 = "<button onclick='FOO.setCha(" + (charisma + 2) +")'>Charisma</button>";
            var arr = [button1, button2, button3, button4, button5, button6];
            document.getElementById("human-bonus").innerHTML = "Pick an attribute to add your + 2 bonus to<br>" + arr;
        },

        pickBarbarian: function(){
            hp += 12;
            localStorage.setItem("hp", hp);
            fort += 2;
            localStorage.setItem("fort", fort);
            bab = 1;
            localStorage.setItem("bab", bab);
            totalSkillPoints += (4 + intMod);
            FOO.dispSkills();
            FOO.addSpeed(10); // fast movement
            localStorage.setItem("speed", speed);
            charClass = "barbarian";
            localStorage.setItem("charClass", charClass);
            classAbilities = ["rage"];
            localStorage.setItem("classAbilities", classAbilities);

        },

        pickBard: function() {
            hp += 8;
            localStorage.setItem("hp", hp);
            ref += 2;
            localStorage.setItem("ref", ref);
            will += 2;
            localStorage.setItem("will", will);
            // the bardic knowledge bonuses
            Arcana.misc = 1;
            Dungeoneering.misc = 1;
            Engineering.misc = 1;
            Geography.misc = 1;
            History.misc = 1;
            Local.misc = 1;
            Nature.misc = 1;
            Nobility.misc = 1;
            Planes.misc = 1;
            Religion.misc = 1;
            totalSkillPoints += (6 + intMod);
            FOO.dispSkills();
            charClass = "bard";
            localStorage.setItem("charClass", charClass);
            classAbilities = ["bardic knowledge",
                                      "cantrips",
                                      "bardic performance",
                                      "countersong",
                                      "fascinate",
                                      "distraction",
                                      "inspire courage + 1"];
            localStorage.setItem("classAbilities", classAbilities);                                    
        },

        pickCleric: function() {
            hp += 8;
            localStorage.setItem("hp", hp);
            fort += 2;
            localStorage.setItem("fort", fort);
            will += 2;
            localStorage.setItem("will", will);
            totalSkillPoints += (2 + intMod);
            FOO.dispSkills();
            charClass = "cleric";
            localStorage.setItem("charClass", charClass);
            classAbilities = ["aura",
                                      "channel energy 1d6",
                                      "domains",
                                      "orisons",
                                      "spontaneous casting"];
            localStorage.setItem("classAbilities", classAbilities);
        },

        pickDruid: function() {
            hp += 8;
            localStorage.setItem("hp", hp);
            fort += 2;
            localStorage.setItem("fort", fort);
            ref += 2;
            localStorage.setItem("ref", ref);
            will += 2;
            localStorage.setItem("will", will);
            totalSkillPoints += (4 + intMod);
            FOO.dispSkills();
            // nature sense bonuses
            Nature.misc = 2;
            Survival.misc = 2;
            charClass = "druid";
            localStorage.setItem("charClass", charClass);
            classAbilities = ["nature bond",
                                      "nature sense",
                                      "orisons",
                                      "wild empathy"];
            localStorage.setItem("classAbilities", classAbilities);
        },

        pickFighter: function() {
            hp += 10;
            localStorage.setItem("hp", hp);
            fort += 2;
            localStorage.setItem("fort", fort);
            bab = 1;
            localStorage.setItem("bab", bab);
            cmb += 1;
            cmd += 1;
            localStorage.setItem("cmb", cmb);
            localStorage.setItem("cmd", cmd);
            totalSkillPoints += (2 + intMod);
            FOO.dispSkills();
            totalFeats += 1; // fighter bonus feat
            FOO.dispFeats();
            charClass = "fighter";
            localStorage.setItem("charClass", charClass);
        },

        pickMonk: function() {
            hp += 8;
            localStorage.setItem("hp", hp);
            fort += 2;
            localStorage.setItem("fort", fort);
            ref += 2;
            localStorage.setItem("ref", ref);
            will += 2;
            localStorage.setItem("will", will);
            totalSkillPoints += (4 + intMod);
            FOO.dispSkills();
            totalFeats += 1;
            featList.push("Improved Unarmed Strike");
            featList.push("Stunning Fist");
            charClass = "monk";
            localStorage.setItem("charClass", charClass);
            classAbilities = ["flurry of blows"];
            localStorage.setItem("classAbilities", classAbilities);
        },

        pickPaladin: function() {
            hp += 10;
            localStorage.setItem("hp", hp);
            fort += 2;
            localStorage.setItem("fort", fort);
            ref += 2;
            localStorage.setItem("ref", ref);
            will += 2;
            localStorage.setItem("will", will);
            bab = 1;
            localStorage.setItem("bab", bab);
            cmb += 1;
            cmd += 1;
            localStorage.setItem("cmb", cmb);
            localStorage.setItem("cmd", cmd);
            totalSkillPoints += (2 + intMod);
            FOO.dispSkills();
            charClass = "paladin";
            localStorage.setItem("charClass", charClass);
            classAbilities = ["aura of good",
                                      "detect evil",
                                      "smit evil 1/day"];
            localStorage.setItem("classAbilities", classAbilities);
        },

        pickRanger: function() {
            hp += 10;
            localStorage.setItem("hp", hp);
            fort += 2;
            localStorage.setItem("fort", fort);
            ref += 2;
            localStorage.setItem("ref", ref);
            bab = 1;
            cmb += 1;
            cmd += 1;
            localStorage.setItem("cmb", cmb);
            localStorage.setItem("cmd", cmd);
            localStorage.setItem("bab", bab);
            totalSkillPoints += (6 + intMod);
            FOO.dispSkills();
            charClass = "ranger";
            localStorage.setItem("charClass", charClass);
            classAbilities = ["favored enemy",
                                      "track",
                                      "wild empathy"];
            localStorage.setItem("classAbilities", classAbilities);
        },

        pickRogue: function() {
            hp += 8;
            localStorage.setItem("hp", hp);
            ref += 2;
            localStorage.setItem("ref", ref);
            DisableDevice.misc = 1; // trapfinding bonus
            totalSkillPoints += (8 + intMod);
            FOO.dispSkills();
            charClass = "rogue";
            localStorage.setItem("charClass", charClass);
            classAbilities = ["sneak attack 1d6",
                                      "trapfinding"];
            localStorage.setItem("classAbilities", classAbilities);
        },

        pickSorceror: function() {
            hp += 6;
            localStorage.setItem("hp", hp);
            will += 2;
            localStorage.setItem("will", will);
            totalSkillPoints += (2 + intMod);
            FOO.dispSkills();
            featList.push("Eschew Materials");
            charClass = "sorceror";
            localStorage.setItem("charClass", charClass);
            classAbilities = ["cantrips"];
            localStorage.setItem("classAbilities", classAbilities);
        },

        pickWizard: function() {
            hp += 6;
            localStorage.setItem("hp", hp);
            will += 2;
            localStorage.setItem("will", will);
            totalSkillPoints += (2 + intMod);
            FOO.dispSkills();
            featList.push("Scribe Scroll");
            charClass = "wizard";
            localStorage.setItem("charClass", charClass);
            classAbilities = ["arcane bond",
                                      "cantrips"];
            localStorage.setItem("classAbilities", classAbilities);
        },

        selectFeat: function(f) {
            // adds the feat f to the feat list
            featList.push(f);
            localStorage.setItem("featList", featList);
            totalFeats -=1;
            FOO.dispFeats();
        },

        addSpell: function(s) {
            // ads spell s to the spell list
            spells.push(s);
            localStorage.setItem("spells", spells);
        },

        /*these functions are for
        the wizard, selecting specialist
        and opposed/banned school
        of magic and type of familiar*/
        specialize: function(s) {
            spec = s;
            localStorage.setItem("spec", spec);
        },

        ban: function(s) {
            banned.push(s);
            localStorage.setItem("banned", banned);
        },

        bat: function() {
            Fly.misc += 3;
            Fly.total = Fly.misc + Fly.mod + Fly.ranks;
            localStorage.setItem("Fly", Fly.total);
        },

        cat: function() {
            Stealth.misc += 3;
            Stealth.total = Stealth.misc + Stealth.mod + Stealth.ranks;
            localStorage.setItem("Stealth", Stealth.total);
        },

        hawk: function() {
            Perception.misc += 3;
            Perception.total = Perception.misc + Perception.mod + Perception.ranks;
            localStorage.setItem("Perception", Perception.total);
        },

        lizard: function() {
            Climb.misc += 3;
            Climb.total = Climb.misc + Climb.mod + Climb.ranks;
            localStorage.setItem("Climb", Climb.total);
        },

        monkey: function() {
            Acrobatics.misc += 3;
            Acrobatics.total = Acrobatics.misc + Acrobatics.mod + Acrobatics.ranks;
            localStorage.setItem("Acrobatics", Acrobatics.total);            
        },

        owl: function() {
            Perception.misc += 3;
            Perception.total = Perception.misc + Perception.mod + Perception.ranks;
            localStorage.setItem("Perception", Perception.total);            
        },

        raven: function() {
            Appraise.misc += 3;
            Appraise.total = Appraise.misc + Appraise.mod + Appraise.ranks;
            localStorage.setItem("Appraise", Appraise.total);
        },

        viper: function() {
            Bluff.misc += 3;
            Bluff.total = Bluff.misc + Bluff.mod + Bluff.ranks;
            localStorage.setItem("Bluff", Bluff.total);            
        },

        toad: function() {
            hp += 3;
            localStorage.setItem("hp", hp);
        },

        weasel: function() {
            ref += 2;
            localStorage.setItem("ref", ref);
        },

        rat: function() {
            fort += 2;
            localStorage.setItem("fort", fort);
        },        

        addInit: function(x) {
            // probably only for improved init feat
            inititiative += x;
            localStorage.setItem("inititiative", inititiative);
        },

        addSpeed: function(x) {
            // adds speed for barbarian and fast movement feat, etc.
            speed += x;
        },

        /* the next funcitons will add a rank
            to the given skill and then add 3
            bonus misc. points if it is a class
            skill. if the skill has ranks, nothing
            will change, because a char can
            have a max of 1 skil rank per 
            character level. there will also be 
            functions with a '2' at the end
            that will increment skills by 
            other means like selecting
            a feat, etc */

        addAcrobatics: function() {
            if (Acrobatics.ranks == 1) {
                return null;
            } else if (charClass == ("barbarian" || "bard" || "monk" || "rogue")) {
                    Acrobatics.ranks = 1;
                    totalSkillPoints -= 1;
                    Acrobatics.misc += 3;
                    Acrobatics.total = Acrobatics.misc + Acrobatics.mod + Acrobatics.ranks;
                    localStorage.setItem("Acrobatics", Acrobatics.total);
                    FOO.dispSkills();
                    document.getElementById("acrobatics").innerHTML = Acrobatics.total;
                } else {
                    Acrobatics.ranks = 1;
                    totalSkillPoints -= 1;
                    Acrobatics.total = Acrobatics.misc + Acrobatics.mod + Acrobatics.ranks;
                    localStorage.setItem("Acrobatics", Acrobatics.total);
                    FOO.dispSkills();
                    document.getElementById("acrobatics").innerHTML = Acrobatics.total;
                }
            },

        addAcrobatics2: function() {
            Acrobatics.misc += 2;
                    Acrobatics.total = Acrobatics.misc + Acrobatics.mod + Acrobatics.ranks;
                    localStorage.setItem("Acrobatics", Acrobatics.total);            
        },

        addAppraise: function() {
                if (Appraise.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "cleric" || "rogue" || "sorceror" || "wizard")) {
                    Appraise.ranks = 1;
                    totalSkillPoints -= 1;
                    Appraise.misc += 3;
                    Appraise.total = Appraise.ranks + Appraise.mod + Appraise.misc;
                    localStorage.setItem("Appraise", Appraise.total);
                    FOO.dispSkills();
                    document.getElementById("appraise").innerHTML = Appraise.total;
                } else {
                    Appraise.ranks = 1;
                    totalSkillPoints -= 1;
                    Appraise.total = Appraise.ranks + Appraise.mod + Appraise.misc;
                    localStorage.setItem("Appraise", Appraise.total);
                    FOO.dispSkills();
                    document.getElementById("appraise").innerHTML = Appraise.total;
                }           
            },

        addAppraise2: function() {
            Appraise.misc += 2;
                    Appraise.total = Appraise.ranks + Appraise.mod + Appraise.misc;
                    localStorage.setItem("Appraise", Appraise.total);            
        },

        addBluff: function() {
                if (Bluff.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "rogue" || "sorceror")) {
                    Bluff.ranks = 1;
                    totalSkillPoints -= 1;
                    Bluff.misc += 3;
                    Bluff.total = Bluff.ranks + Bluff.mod + Bluff.misc;
                    localStorage.setItem("Bluff", Bluff.total);
                    FOO.dispSkills();
                    document.getElementById("bluff").innerHTML = Bluff.total;
                } else {
                Bluff.ranks = 1;
                totalSkillPoints -= 1;
                Bluff.total = Bluff.ranks + Bluff.mod + Bluff.misc;
                localStorage.setItem("Bluff", Bluff.total);
                    FOO.dispSkills();
                    document.getElementById("bluff").innerHTML = Bluff.total;
                }
            },

        addBluff2: function() {
            Bluff.misc += 2;
                Bluff.total = Bluff.ranks + Bluff.mod + Bluff.misc;
                localStorage.setItem("Bluff", Bluff.total);            
        },

        addClimb: function() {            
          if (Climb.ranks == 1) {
            return null;
          }
            else if (charClass == ("barbarian" || "bard" || "druid" || "fighter" || "monk" || "ranger" || "rogue")) {
                Climb.ranks = 1;
                totalSkillPoints -= 1;  
                Climb.misc += 3;
                Climb.total = Climb.ranks + Climb.mod + Climb.misc;
                localStorage.setItem("Climb", Climb.total);
                FOO.dispSkills();                                    
                    document.getElementById("climb").innerHTML = Climb.total;
                } else {
                    Climb.ranks = 1;
                totalSkillPoints -= 1;
                Climb.total = Climb.ranks + Climb.mod + Climb.misc;
                localStorage.setItem("Climb", Climb.total);
                    FOO.dispSkills();
                    document.getElementById("climb").innerHTML = Climb.total;
                }
            },

        addClimb2: function() {
            Climb.misc += 2;
                Climb.total = Climb.ranks + Climb.mod + Climb.misc;
                localStorage.setItem("Climb", Climb.total);            
        },

        addCraft: function() {
                if (Craft.ranks == 1) {
                    return null;
                }     
                else { 
                Craft.ranks = 1;
                Craft.misc += 3;
                totalSkillPoints -= 1;
                Craft.total = Craft.ranks + Craft.mod + Craft.misc;
                localStorage.setItem("Craft", Craft.total);
                FOO.dispSkills();
                document.getElementById("craft").innerHTML = Craft.total;
            }
        },

        addCraft2: function() {
            Craft.misc += 2;
                Craft.total = Craft.ranks + Craft.mod + Craft.misc;
                localStorage.setItem("Craft", Craft.total);            
        },

        addDiplomacy: function() {        
                if (Diplomacy.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "cleric" || "paladin" || "rouge")) {
                Diplomacy.ranks = 1;
                totalSkillPoints -= 1;    
                    Diplomacy.misc += 3;
                    Diplomacy.total = Diplomacy.ranks + Diplomacy.mod + Diplomacy.misc;
                    localStorage.setItem("Diplomacy", Diplomacy.total);
                    FOO.dispSkills();                                    
                    document.getElementById("diplomacy").innerHTML = Diplomacy.total;
                } else {
                Diplomacy.ranks = 1;
                totalSkillPoints -= 1;    
                Diplomacy.total = Diplomacy.ranks + Diplomacy.mod + Diplomacy.misc;
                localStorage.setItem("Diplomacy", Diplomacy.total);
                    FOO.dispSkills();
                    document.getElementById("diplomacy").innerHTML = Diplomacy.total;
                }
            },

        addDiplomacy2: function() {
            Diplomacy.misc += 2;
                Diplomacy.total = Diplomacy.ranks + Diplomacy.mod + Diplomacy.misc;
                localStorage.setItem("Diplomacy", Diplomacy.total);            
        },

        addDisableDevice: function() {            
                if (DisableDevice.ranks == 1) {
                    return null;
                }
                else if (charClass == "rouge") {
                DisableDevice.ranks = 1;
                totalSkillPoints -= 1;
                    DisableDevice.misc += 3;
                    DisableDevice.total = DisableDevice.ranks + DisableDevice.mod + DisableDevice.misc;
                    FOO.dispSkills();                                    
                    document.getElementById("disable-device").innerHTML = DisableDevice.total;
                    localStorage.setItem("DisableDevice", DisableDevice.total);
                } else {
                DisableDevice.ranks = 1;
                totalSkillPoints -= 1;
                DisableDevice.total = DisableDevice.ranks + DisableDevice.mod + DisableDevice.misc;
                localStorage.setItem("DisableDevice", DisableDevice.total);
                    FOO.dispSkills();
                    document.getElementById("disable-device").innerHTML = DisableDevice.total;
                }
            },

        addDisableDevice2: function() {
            DisableDevice.misc += 2;
                DisableDevice.total = DisableDevice.ranks + DisableDevice.mod + DisableDevice.misc;
                localStorage.setItem("DisableDevice", DisableDevice.total);            
        },

        addDisguise: function() {
                if (Disguise.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "rouge")) {
                Disguise.ranks = 1;
                totalSkillPoints -= 1;
                    Disguise.misc += 3;
                    Disguise.total = Disguise.ranks + Disguise.mod + Disguise.misc;
                    localStorage.setItem("Disguise", Disguise.total);
                    FOO.dispSkills();
                    document.getElementById("disguise").innerHTML = Disguise.total;
                } else {
                Disguise.ranks = 1;
                totalSkillPoints -= 1;
                Disguise.total = Disguise.ranks + Disguise.mod + Disguise.misc;
                localStorage.setItem("Disguise", Disguise.total);
                    FOO.dispSkills();
                    document.getElementById("disguise").innerHTML = Disguise.total;
                }
            },

        addDisguise2: function() {
            Disguise.misc += 2;
                    Disguise.total = Disguise.ranks + Disguise.mod + Disguise.misc;
                    localStorage.setItem("Disguise", Disguise.total);            
        },

        addEscapeArtist: function() {
                if (EscapeArtist.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "cleric" || "paladin" || "rouge")) {
                EscapeArtist.ranks = 1;
                totalSkillPoints -= 1;
                    EscapeArtist.misc += 3;
                    EscapeArtist.total = EscapeArtist.ranks + EscapeArtist.mod + EscapeArtist.misc;
                    localStorage.setItem("EscapeArtist", EscapeArtist.total);
                    FOO.dispSkills();
                    document.getElementById("escape-artist").innerHTML = EscapeArtist.total;
                } else {
                EscapeArtist.ranks = 1;
                totalSkillPoints -= 1;
                EscapeArtist.total = EscapeArtist.ranks + EscapeArtist.mod + EscapeArtist.misc;
                localStorage.setItem("EscapeArtist", EscapeArtist.total);
                    FOO.dispSkills();
                    document.getElementById("escape-artist").innerHTML = EscapeArtist.total;
                }
            },

        addEscapeArtist2: function() {
            EscapeArtist.misc += 2;
                    EscapeArtist.total = EscapeArtist.ranks + EscapeArtist.mod + EscapeArtist.misc;
                    localStorage.setItem("EscapeArtist", EscapeArtist.total);            
        },

        addFly: function() {
                if (Fly.ranks == 1) {
                    return null;
                }
                else if (charClass == ("druid" || "sorceror" || "wizard")) {
                Fly.ranks = 1;
                totalSkillPoints -= 1;
                    Fly.misc += 3;
                    Fly.total = Fly.ranks + Fly.mod + Fly.misc;
                    localStorage.setItem("Fly", Fly.total);
                    FOO.dispSkills();
                    document.getElementById("fly").innerHTML = Fly.total;
                } else {
                Fly.ranks = 1;
                totalSkillPoints -= 1;
                Fly.total = Fly.ranks + Fly.mod + Fly.misc;
                localStorage.setItem("Fly", Fly.total);
                FOO.dispSkills();
                    document.getElementById("fly").innerHTML = Fly.total;
                }
            },

        addFly2: function() {
            Fly.misc += 2;
                    Fly.total = Fly.ranks + Fly.mod + Fly.misc;
                    localStorage.setItem("Fly", Fly.total);            
        },

        addHandleAnimal: function() {
                if (HandleAnimal.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "cleric" || "paladin" || "rouge")) {
                HandleAnimal.ranks = 1;
                totalSkillPoints -= 1;
                    HandleAnimal.misc += 3;
                    HandleAnimal.total = HandleAnimal.ranks + HandleAnimal.mod + HandleAnimal.misc;
                    localStorage.setItem("HandleAnimal", HandleAnimal.total);
                    FOO.dispSkills();
                    document.getElementById("handle-animal").innerHTML = HandleAnimal.total;
                } else {
                HandleAnimal.ranks = 1;
                totalSkillPoints -= 1;
                HandleAnimal.total = HandleAnimal.ranks + HandleAnimal.mod + HandleAnimal.misc;
                localStorage.setItem("HandleAnimal", HandleAnimal.total);
                    FOO.dispSkills();
                    document.getElementById("handle-animal").innerHTML = HandleAnimal.total;
                }
            },

        addHandleAnimal2: function() {
            HandleAnimal.misc += 2;
                    HandleAnimal.total = HandleAnimal.ranks + HandleAnimal.mod + HandleAnimal.misc;
                    localStorage.setItem("HandleAnimal", HandleAnimal.total);            
        },

        addHeal: function() {
                if (Heal.ranks == 1) {
                    return null;
                }
                else if (charClass == ("barbarian" || "druid" || "fighter" || "paladin" || "ranger")) {
                Heal.ranks = 1;
                totalSkillPoints -= 1;
                    Heal.misc += 3;
                    Heal.total = Heal.ranks + Heal.mod + Heal.misc;
                    localStorage.setItem("Heal", Heal.total);
                    FOO.dispSkills();
                     document.getElementById("heal").innerHTML = Heal.total;
                } else {
                Heal.ranks = 1;
                totalSkillPoints -= 1;
                Heal.total = Heal.ranks + Heal.mod + Heal.misc;
                localStorage.setItem("Heal", Heal.total);
                    FOO.dispSkills();
                    document.getElementById("heal").innerHTML = Heal.total;
                }
            },

        addHeal2: function() {
            Heal.misc += 2;
                    Heal.misc += 3;
                    Heal.total = Heal.ranks + Heal.mod + Heal.misc;            
        },
        
        addIntimidate: function() {    
                if (Intimidate.ranks == 1) {
                    return null;
                }
                else if (charClass == ("barbarian" || "bard" || "fighter" || "monk" || "ranger" || "rogue" || "sorceror")) {
                Intimidate.ranks = 1;
                totalSkillPoints -= 1;
                    Intimidate.misc += 3;
                    Intimidate.total = Intimidate.ranks + Intimidate.mod + Intimidate.misc;
                    localStorage.setItem("Intimidate", Intimidate.total);
                    FOO.dispSkills();
                    document.getElementById("intimidate").innerHTML = Intimidate.total;
                } else {
                Intimidate.ranks = 1;
                totalSkillPoints -= 1;
                Intimidate.total = Intimidate.ranks + Intimidate.mod + Intimidate.misc;
                localStorage.setItem("Intimidate", Intimidate.total);
                    FOO.dispSkills();
                    document.getElementById("intimidate").innerHTML = Intimidate.total;
                }
            },

        addIntimidate2: function() {
            Intimidate.misc += 2;
                    Intimidate.total = Intimidate.ranks + Intimidate.mod + Intimidate.misc;
                    localStorage.setItem("Intimidate", Intimidate.total);            
        },

        intimidatingProwess: function() {
            // for the intimidating prowess feat
            Intimidate.misc += strMod;
                    Intimidate.total = Intimidate.ranks + Intimidate.mod + Intimidate.misc;
                    localStorage.setItem("Intimidate", Intimidate.total);            
        },

        addArcana: function() {        
                if (Arcana.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "cleric" || "sorceror" || "wizard")) {
                Arcana.ranks = 1;
                totalSkillPoints -= 1;
                    Arcana.misc += 3;
                    Arcana.total = Arcana.ranks + Arcana.mod + Arcana.misc;
                    localStorage.setItem("Arcana", Arcana.total);
                    FOO.dispSkills();
                    document.getElementById("arcana").innerHTML = Arcana.total;
                } else {
                Arcana.ranks = 1;
                totalSkillPoints -= 1;
                Arcana.total = Arcana.ranks + Arcana.mod + Arcana.misc;
                localStorage.setItem("Arcana", Arcana.total);
                    FOO.dispSkills();
                    document.getElementById("arcana").innerHTML = Arcana.total;
                }
            },

        addDungeoneering: function() {            
                if (dungeoneering.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "fighter" || "ranger" || "rouge" || "wizard")) {
                Dungeoneering.ranks = 1;
                totalSkillPoints -= 1;
                    Dungeoneering.misc += 3;
                    Dungeoneering.total = Dungeoneering.ranks + Dungeoneering.mod + Dungeoneering.misc;
                    localStorage.setItem("Dungeoneering", Dungeoneering.total);
                    FOO.dispSkills();
                    document.getElementById("dungeoneering").innerHTML = Dungeoneering.total;
                } else {
                Dungeoneering.ranks = 1;
                totalSkillPoints -= 1;
                Dungeoneering.total = Dungeoneering.ranks + Dungeoneering.mod + Dungeoneering.misc;
                localStorage.setItem("Dungeoneering", Dungeoneering.total);
                    FOO.dispSkills();
                    document.getElementById("dungeoneering").innerHTML = Dungeoneering.total;
                }
            },

        addEngineering: function() {
                if (Engineering.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "fighter" || "wizard")) {
                Engineering.ranks = 1;
                totalSkillPoints -= 1;
                    Engineering.misc += 3;
                    Engineering.total = Engineering.ranks + Engineering.mod + Engineering.misc;
                    localStorage.setItem("Engineering", Engineering.total);
                    FOO.dispSkills();
                    document.getElementById("engineering").innerHTML = Engineering.total;
                } else {
                Engineering.ranks = 1;
                totalSkillPoints -= 1;
                Engineering.total = Engineering.ranks + Engineering.mod + Engineering.misc;
                localStorage.setItem("Engineering", Engineering.total);
                    FOO.dispSkills();
                    document.getElementById("engineering").innerHTML = Engineering.total;
                }
            },
        addGeography: function() {
                if (Geography.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "druid" || "ranger" || "wizard")) {
                Geography.ranks = 1;
                totalSkillPoints -= 1;
                    Geography.misc += 3;
                    Geography.total = Geography.ranks + Geography.mod + Geography.misc;
                    localStorage.setItem("Geography", Geography.total);
                    FOO.dispSkills();
                    document.getElementById("geography").innerHTML = Geography.total;
                } else {
                Geography.ranks = 1;
                totalSkillPoints -= 1;
                Geography.total = Geography.ranks + Geography.mod + Geography.misc;
                localStorage.setItem("Geography", Geography.total);
                    FOO.dispSkills();
                    document.getElementById("geography").innerHTML = Geography.total;
                }
            },
    
        addHistory: function() {        
                if (History.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "cleric" || "cleric" || "monk" || "wizard")) {
                History.ranks = 1;
                totalSkillPoints -= 1;
                    History.misc += 3;
                    History.total = History.ranks + History.mod + History.misc;
                    localStorage.setItem("History", History.total);
                    FOO.dispSkills();
                    document.getElementById("history").innerHTML = History.total;
                } else {
                    History.ranks = 1;
                totalSkillPoints -= 1;
                History.total = History.ranks + History.mod + History.misc;
                localStorage.setItem("History", History.total);
                    FOO.dispSkills();
                    document.getElementById("history").innerHTML = History.total;
                }   
            },
        
        addLocal: function() {    
                if (Local.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "rouge" || "wizard")) {
                Local.ranks = 1;
                totalSkillPoints -= 1;
                    Local.misc += 3;
                    Local.total = Local.ranks + Local.mod + Local.misc;
                    localStorage.setItem("Local", Local.total);
                    FOO.dispSkills();
                    document.getElementById("local").innerHTML = Local.total;
                } else {
                Local.ranks = 1;
                totalSkillPoints -= 1;
                Local.total = Local.ranks + Local.mod + Local.misc;
                localStorage.setItem("Local", Local.total);
                    FOO.dispSkills();
                    document.getElementById("local").innerHTML = Local.total;
                }   
            },    

        addNature: function() {            
                if (Nature.ranks == 1) {
                    return null;
                }
                else if (charClass == ("barbarian" || "bard" || "druid" || "ranger" || "wizard")) {
                Nature.ranks = 1;
                totalSkillPoints -= 1;   
                    Nature.misc += 3;
                    Nature.total = Nature.ranks + Nature.mod + Nature.misc;
                    localStorage.setItem("Nature", Nature.total);
                    FOO.dispSkills();                                    
                    document.getElementById("nature").innerHTML = Nature.total;
                } else {
                Nature.ranks = 1;
                totalSkillPoints -= 1;
                Nature.total = Nature.ranks + Nature.mod + Nature.misc;
                localStorage.setItem("Nature", Nature.total);
                    FOO.dispSkills();
                    document.getElementById("nature").innerHTML = Nature.total;
                }   
            },        

        addNobility: function() {            
                if (Nobility.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "cleric" || "paladin" || "wizard")) {
                Nobility.ranks = 1;
                totalSkillPoints -= 1;       
                    Nobility.misc += 3;
                    Nobility.total = Nobility.ranks + Nobility.mod + Nobility.misc;
                    localStorage.setItem("Nobility", Nobility.total);
                    FOO.dispSkills();                                
                    document.getElementById("nobility").innerHTML = Nobility.total;
                } else {
                Nobility.ranks = 1;
                totalSkillPoints -= 1;
                Nobility.total = Nobility.ranks + Nobility.mod + Nobility.misc;
                localStorage.setItem("Nobility", Nobility.total);
                    FOO.dispSkills();
                    document.getElementById("nobility").innerHTML = Nobility.total;
                }   
            },
        

        addPlanes: function() {            
                if (Planes.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "cleric" || "wizard")) {
                Planes.ranks = 1;
                totalSkillPoints -= 1;       
                    Planes.misc += 3;
                    Planes.total = Planes.ranks + Planes.mod + Planes.misc;
                    localStorage.setItem("Planes", Planes.total);
                    FOO.dispSkills();                                    
                    document.getElementById("planes").innerHTML = Planes.total;
                } else {
                Planes.ranks = 1;
                totalSkillPoints -= 1;
                Planes.total = Planes.ranks + Planes.mod + Planes.misc;
                localStorage.setItem("Planes", Planes.total);
                    FOO.dispSkills();
                    document.getElementById("planes").innerHTML = Planes.total;
                }   
            },
        

        addReligion: function() {            
                if (Religion.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "cleric" || "monk" || "paladin" || "wizard")) {
                Religion.ranks = 1;
                totalSkillPoints -= 1;   
                    Religion.misc += 3;
                    Religion.total = Religion.ranks + Religion.mod + Religion.misc;
                    localStorage.setItem("Religion", Religion.total);
                    FOO.dispSkills();                                    
                    document.getElementById("religion").innerHTML = Religion.total;
                } else {
                Religion.ranks = 1;
                totalSkillPoints -= 1;
                Religion.total = Religion.ranks + Religion.mod + Religion.misc;
                localStorage.setItem("Religion", Religion.total);
                    FOO.dispSkills();
                    document.getElementById("religion").innerHTML = Religion.total;
                }   
            },
        
        addLinguistics: function() {            
                if (Linguistics.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "cleric" || "rouge" || "wizard")) {
                Linguistics.ranks = 1;
                totalSkillPoints -= 1;   
                    Linguistics.misc += 3;
                    Linguistics.total = Linguistics.ranks + Linguistics.mod + Linguistics.misc;
                    localStorage.setItem("Linguistics", Linguistics.total);
                    FOO.dispSkills();                                    
                    document.getElementById("linguistics").innerHTML = Linguistics.total;
                } else {
                Linguistics.ranks = 1;
                totalSkillPoints -= 1;
                Linguistics.total = Linguistics.ranks + Linguistics.mod + Linguistics.misc;
                localStorage.setItem("Linguistics", Linguistics.total);
                    FOO.dispSkills();
                    document.getElementById("linguistics").innerHTML = Linguistics.total;
                }   
            },
        
        addPerception: function() {            
                if (Perception.ranks == 1) {
                    return null;
                }
                else if (charClass == ("barbarian" || "bard" || "druid" || "monk" || "ranger" || "rouge")) {
                Perception.ranks = 1;
                totalSkillPoints -= 1;    
                    Perception.misc += 3;
                    Perception.total = Perception.ranks + Perception.mod + Perception.misc;
                    localStorage.setItem("Perception", Perception.total);
                    FOO.dispSkills();                                
                    document.getElementById("perception").innerHTML = Perception.total;
                } else {
                Perception.ranks = 1;
                totalSkillPoints -= 1;    
                Perception.total = Perception.ranks + Perception.mod + Perception.misc;
                localStorage.setItem("Perception", Perception.total);
                    FOO.dispSkills();
                    document.getElementById("perception").innerHTML = Perception.total;
                }   
            },

        addPerception2: function() {
            Perception.misc += 2;
                    Perception.total = Perception.ranks + Perception.mod + Perception.misc;
                    localStorage.setItem("Perception", Perception.total);            
        },

        addPerform: function() {            
                if (Perform.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "monk" || "rouge")) {
                Perform.ranks = 1;
                totalSkillPoints -= 1;  
                    Perform.misc += 3;
                    Perform.total = Perform.ranks + Perform.mod + Perform.misc;
                    localStorage.setItem("Perform", Perform.total);
                    FOO.dispSkills();                                    
                    document.getElementById("perform").innerHTML = Perform.total;
                } else {
                Perform.ranks = 1;
                totalSkillPoints -= 1;  
                Perform.total = Perform.ranks + Perform.mod + Perform.misc;
                localStorage.setItem("Perform", Perform.total);
                    FOO.dispSkills();
                    document.getElementById("perform").innerHTML = Perform.total;
                }   
            },        

        addProfession: function() {
                if (Profession.ranks == 1) {
                    return null;
                }        
                else {
                Profession.ranks = 1;
                Profession.misc += 3;
                totalSkillPoints -= 1;
                Profession.total = Profession.ranks + Profession.mod + Profession.misc;
                localStorage.setItem("Profession", Profession.total);
                 FOO.dispSkills();
                 document.getElementById("profession").innerHTML = Profession.total;
             }
        },
        
        addRide: function() {            
                if (Ride.ranks == 1) {
                    return null;
                }
                else if (charClass == ("barbarian" || "druid" || "monk" || "paladin" || "ranger")) {
                Ride.ranks = 1;
                totalSkillPoints -= 1;   
                    Ride.misc += 3;
                    Ride.total = Ride.ranks + Ride.mod + Ride.misc;
                    localStorage.setItem("Ride", Ride.total);
                    FOO.dispSkills();                                    
                    document.getElementById("ride").innerHTML = Ride.total;
                } else {
                    Ride.ranks = 1;
                    totalSkillPoints -= 1;
                    Ride.total = Ride.ranks + Ride.mod + Ride.misc;
                    localStorage.setItem("Ride", Ride.total);
                    FOO.dispSkills();
                    document.getElementById("ride").innerHTML = Ride.total;
                }   
            },        

        addSenseMotive: function() {            
                if (SenseMotive.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "cleric" || "monk" || "paladin" || "rouge")) {
                SenseMotive.ranks = 1;
                totalSkillPoints -= 1;       
                    SenseMotive.misc += 3;
                    SenseMotive.total = SenseMotive.ranks + SenseMotive.mod + SenseMotive.misc;
                    localStorage.setItem("SenseMotive", SenseMotive.total);
                    FOO.dispSkills();                                
                    document.getElementById("sense-motive").innerHTML = SenseMotive.total
                } else {
                SenseMotive.ranks = 1;
                totalSkillPoints -= 1;
                SenseMotive.total = SenseMotive.ranks + SenseMotive.mod + SenseMotive.misc;
                localStorage.setItem("SenseMotive", SenseMotive.total);
                    FOO.dispSkills();
                    document.getElementById("sense-motive").innerHTML = SenseMotive.total;
                }   
            },

        addSenseMotive2: function() {
            SenseMotive.misc += 2;
                    SenseMotive.total = SenseMotive.ranks + SenseMotive.mod + SenseMotive.misc;
                    localStorage.setItem("SenseMotive", SenseMotive.total);            
        },

        addSleightOfHand: function() {            
                if (SleightOfHand.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "rouge")) {
                SleightOfHand.ranks = 1;
                totalSkillPoints -= 1;  
                    SleightOfHand.misc += 3;
                    SleightOfHand.total = SleightOfHand.ranks + SleightOfHand.mod + SleightOfHand.misc;
                    localStorage.setItem("SleightOfHand", SleightOfHand.total);
                    FOO.dispSkills();                                    
                    document.getElementById("sleight-of-hand").innerHTML = SleightOfHand.total;
                } else {
                SleightOfHand.ranks = 1;
                totalSkillPoints -= 1;  
                SleightOfHand.total = SleightOfHand.ranks + SleightOfHand.mod + SleightOfHand.misc;
                localStorage.setItem("SleightOfHand", SleightOfHand.total);
                    FOO.dispSkills();
                    document.getElementById("sleight-of-hand").innerHTML = SleightOfHand.total;
                }   
            },

        addSleightOfHand2: function() {
            SleightOfHand.misc += 2;
                SleightOfHand.total = SleightOfHand.ranks + SleightOfHand.mod + SleightOfHand.misc;
                localStorage.setItem("SleightOfHand", SleightOfHand.total);            
        },

        addSpellcraft: function() {        
                if (Spellcraft.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "cleric" || "druid" || "paladin" || "ranger" || "sorceror" || "wizard")) {
                Spellcraft.ranks = 1;
                totalSkillPoints -= 1;      
                    Spellcraft.misc += 3;
                    Spellcraft.total = Spellcraft.ranks + Spellcraft.mod + Spellcraft.misc;
                    localStorage.setItem("Spellcraft", Spellcraft.total);
                    FOO.dispSkills();                                    
                    document.getElementById("spellcraft").innerHTML = Spellcraft.total
                } else {
                Spellcraft.ranks = 1;
                totalSkillPoints -= 1;
                Spellcraft.total = Spellcraft.ranks + Spellcraft.mod + Spellcraft.misc;
                localStorage.setItem("Spellcraft", Spellcraft.total);
                    FOO.dispSkills();
                    document.getElementById("spellcraft").innerHTML = Spellcraft.total;
                }   
            },

        addSpellcraft2: function() {
            Spellcraft.misc += 2;
                Spellcraft.total = Spellcraft.ranks + Spellcraft.mod + Spellcraft.misc;
                localStorage.setItem("Spellcraft", Spellcraft.total);            
        },
        
        addStealth: function() {            
                if (Stealth.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "monk" || "ranger" || "rogue")) {
                Stealth.ranks = 1;
                totalSkillPoints -= 1;    
                    Stealth.misc += 3;
                    Stealth.total = Stealth.ranks + Stealth.mod + Stealth.misc;
                    localStorage.setItem("Stealth", Stealth.total);
                    FOO.dispSkills();                                
                    document.getElementById("stealth").innerHTML = Stealth.total;
                } else {
                Stealth.ranks = 1;
                totalSkillPoints -= 1;    
                Stealth.total = Stealth.ranks + Stealth.mod + Stealth.misc;
                localStorage.setItem("Stealth", Stealth.total);
                    FOO.dispSkills();
                    document.getElementById("stealth").innerHTML = Stealth.total;
                }   
            },

        addStealth2: function() {
            Stealth.misc += 2;
                    Stealth.total = Stealth.ranks + Stealth.mod + Stealth.misc;
                    localStorage.setItem("Stealth", Stealth.total);            
        },

        addSurvival: function() {            
                if (Survival.ranks == 1) {
                    return null;
                }
                else if (charClass == ("barbarian" || "druid" || "fighter" || "ranger")) {
                Survival.ranks = 1;
                totalSkillPoints -= 1;    
                    Survival.misc += 3;
                    Survival.total = Survival.ranks + Survival.mod + Survival.misc;
                    localStorage.setItem("Survival", Survival.total);
                    FOO.dispSkills();                                    
                    document.getElementById("survival").innerHTML = Survival.total;
                } else {
                Survival.ranks = 1;
                totalSkillPoints -= 1;    
                Survival.total = Survival.ranks + Survival.mod + Survival.misc;
                localStorage.setItem("Survival", Survival.total);
                    FOO.dispSkills();
                    document.getElementById("survival").innerHTML = Survival.total;
                }   
            },

        addSurvival2: function() {
            Survival.misc += 2;
                Survival.total = Survival.ranks + Survival.mod + Survival.misc;
                localStorage.setItem("Survival", Survival.total);            
        },
        
        addSwim: function() {            
                if (Swim.ranks == 1) {
                    return null;
                }
                else if (charClass == ("barbarian" || "druid" || "fighter" || "monk" || "ranger" || "rogue")) {
                Swim.ranks = 1;
                totalSkillPoints -= 1;  
                    Swim.misc += 3;
                    Swim.total = Swim.ranks + Swim.mod + Swim.misc;
                    localStorage.setItem("Swim", Swim.total);
                    FOO.dispSkills();                                    
                    document.getElementById("swim").innerHTML = Swim.total
                } else {
                Swim.ranks = 1;
                totalSkillPoints -= 1;  
                Swim.total = Swim.ranks + Swim.mod + Swim.misc;
                localStorage.setItem("Swim", Swim.total);
                    FOO.dispSkills();
                    document.getElementById("swim").innerHTML = Swim.total;
                }   
            },
        
        addUseMagicDevice: function() {            
                if (UseMagicDevice.ranks == 1) {
                    return null;
                }
                else if (charClass == ("bard" || "rouge" || "sorceror")) {
                UseMagicDevice.ranks = 1;
                totalSkillPoints -= 1;        
                    UseMagicDevice.misc += 3;
                    UseMagicDevice.total = UseMagicDevice.ranks + UseMagicDevice.mod + UseMagicDevice.misc;
                    localStorage.setItem("UseMagicDevice", UseMagicDevice.total);
                    FOO.dispSkills();                                    
                    document.getElementById("use-magic-device").innerHTML = UseMagicDevice.total;
                } else {
                UseMagicDevice.ranks = 1;
                totalSkillPoints -= 1;       
                UseMagicDevice.total = UseMagicDevice.ranks + UseMagicDevice.mod + UseMagicDevice.misc; 
                localStorage.setItem("UseMagicDevice", UseMagicDevice.total);
                    FOO.dispSkills();
                    document.getElementById("use-magic-device").innerHTML = UseMagicDevice.total;
                }   
            },

        addUseMagicDevice2: function() {
            UseMagicDevice.misc += 2;
            UseMagicDevice.total = UseMagicDevice.misc + UseMagicDevice.mod;
            localStorage.setItem("UseMagicDevice", UseMagicDevice.total);
        },

        finalize: function() {
            /*first check for a valid char
                only str is tested because other scores were most likeley chosen
                if no class/race was chosen or if too many/not enough feats 
                chosen, char is invalid. skills are tested for only > 0 because
                classic generation can potentially return negative skill points
                otherwise, if the character is a wizard, bard, etc, go to the correct page to select spells, etc*/
            if (strength == 0 || charClass == null || race == null || totalFeats != 0 || totalSkillPoints > 0) {
                document.getElementById("invalid").innerHTML = "Invalid Charachter";
            }
            else if (charClass == "wizard") {
                location.assign('/home/luke/seniorProject/main/wizard.html');
            } else if (charClass == "sorceror") {
                location.assign('/home/luke/seniorProject/main/sorceror.html');
            } else if (charClass == 'druid') {
                location.assign('/home/luke/seniorProject/main/druid.html');
            } else if (charClass == 'bard') {
                 location.assign('/home/luke/seniorProject/main/bard.html');
            } else if (charClass == 'cleric') {
                location.assign('/home/luke/seniorProject/main/cleric.html');
            } else {
                location.assign('/home/luke/seniorProject/main/finalize.html');
            }
        },

        wizFinalize: function() {
            /* wizards need their own finalize
            because the other one would make
            them select spells again */
            location.assign('/home/luke/seniorProject/main/responsive-tabs/finalize.html');
        },

        outputChar: function() {
            // outputs the character info
            // to the final html page
            document.getElementById("alignment").innerHTML = "Alignment: " + localStorage.getItem("alignment");
            document.getElementById("race").innerHTML = "Race: " + localStorage.getItem("race");
            document.getElementById("gender").innerHTML = localStorage.getItem("gender");
            document.getElementById("class").innerHTML = "Class: " + localStorage.getItem('charClass');
            document.getElementById("scores").innerHTML = "Str: " + localStorage.getItem("strength") + "(" + localStorage.getItem('strMod') + ")" + "<br>" + "Dex: " + localStorage.getItem("dexterity") + "(" + localStorage.getItem('dexMod') + ")<br>" + "Con: " + localStorage.getItem("constitution") + "(" + localStorage.getItem('conMod') + ")<br>" + "Int: " + localStorage.getItem("intelligence") + "(" + localStorage.getItem('intMod') + ")<br>" + "Wis: " + localStorage.getItem("wisdom") + "(" + localStorage.getItem('wisMod') + ")<br>" + "Cha: " + localStorage.getItem("charisma") + "(" + localStorage.getItem('chaMod') + ")<br><br>";
            document.getElementById("init").innerHTML = "Initiative: " + localStorage.getItem("inititiative");
            document.getElementById("hp").innerHTML = "HP: " + localStorage.getItem('hp');
            document.getElementById("speed").innerHTML = "Speed: " + localStorage.getItem('speed');
            document.getElementById("ac").innerHTML = "AC: " + localStorage.getItem('ac');
            document.getElementById("touch").innerHTML = "Touch: " + localStorage.getItem('touch');
            document.getElementById("saves").innerHTML = "Fortitude: " + localStorage.getItem('fort') + "<br>Reflex: " + localStorage.getItem('ref') + "<br>Will: " + localStorage.getItem('will');
            document.getElementById("bab").innerHTML = "BAB: " + localStorage.getItem('bab');
            document.getElementById("cmb").innerHTML = "CMB: " + localStorage.getItem('cmb');
            document.getElementById("cmd").innerHTML = "CMD: " + localStorage.getItem('cmd');
            document.getElementById("langs").innerHTML = "Languages: " + localStorage.getItem("langs");
            document.getElementById("skills").innerHTML = "Acrobatics: " + localStorage.getItem("Acrobatics") + "<br>" + "Appraise: " + localStorage.getItem("Appraise") + "<br>" + "Bluff: " + localStorage.getItem("Bluff") + "<br>" + "Climb: " + localStorage.getItem("Climb") + "<br>" + "Craft: " + localStorage.getItem("Craft") + "<br>" + "Diplomacy: " + localStorage.getItem("Diplomacy") + "<br>" + "DisableDevice: " + localStorage.getItem("DisableDevice") + "<br>" +     "Disguise: " + localStorage.getItem("Disguise") + "<br>" +     "EscapeArtist: " + localStorage.getItem("EscapeArtist") + "<br>" +     "Fly: " + localStorage.getItem("Fly") + "<br>" +     "HandleAnimal: " + localStorage.getItem("HandleAnimal") + "<br>" +     "Heal: " + localStorage.getItem("Heal") + "<br>" +     "Intimidate: " + localStorage.getItem("Intimidate") + "<br>" +     "Knowledge Arcana: " + localStorage.getItem("Arcana") + "<br>" +     "Knowledge Dungeoneering: " + localStorage.getItem("Dungeoneering") + "<br>" +     "Knowledge Engineering: " + localStorage.getItem("Engineering") + "<br>" +     "Knowledge Geography: " + localStorage.getItem("Geography") + "<br>" +     "Knowledge History: " + localStorage.getItem("History") + "<br>" +     "Knowledge Local: " + localStorage.getItem("Local") + "<br>" +     "Knowledge Nature: " + localStorage.getItem("Nature") + "<br>" +     "Knowledge Nobility: " + localStorage.getItem("Nobility") + "<br>" +     "Knowledge Planes: " + localStorage.getItem("Planes") + "<br>" +     "Knowledge Religion: " + localStorage.getItem("Religion") + "<br>" +     "Linguistics: " + localStorage.getItem("Linguistics") + "<br>" +     "Perception: " + localStorage.getItem("Perception") + "<br>" +     "Perform: " + localStorage.getItem("Perform") + "<br>" +     "Profession: " + localStorage.getItem("Profession") + "<br>" +     "Ride: " + localStorage.getItem("Ride") + "<br>" +     "SenseMotive: " + localStorage.getItem("SenseMotive") + "<br>" +     "Spellcraft: " + localStorage.getItem("Spellcraft") + "<br>" +     "Stealth: " + localStorage.getItem("Stealth") + "<br>" +     "Survival: " + localStorage.getItem("Survival") + "<br>" +     "Swim: " + localStorage.getItem("Swim") + "<br>" +     "UseMagicDevice: " + localStorage.getItem("UseMagicDevice") + "<br>";

            document.getElementById("feats").innerHTML = "Feats: " + localStorage.getItem("featList");
            document.getElementById("traits").innerHTML = "Traits: " + localStorage.getItem("sensesTraits") + "<br>" + localStorage.getItem("skillTraits") + "<br>" + localStorage.getItem("magicalTraits") + "<br>" + localStorage.getItem("offensiveTraits") + "<br>" + localStorage.getItem("defensiveTraits");
            document.getElementById("ability").innerHTML = "Class Abilitities: " + localStorage.getItem("classAbilities");
            document.getElementById("spells").innerHTML = "Spells: " + localStorage.getItem('spells');
            document.getElementById("spec").innerHTML = "Specialization: " + localStorage.getItem("spec") + "<br>Opposed: " + localStorage.getItem("banned");
            document.getElementById("fam").innerHTML = "Familiar: " + localStorage.getItem("familiar", familiar);
        },

    };

})();