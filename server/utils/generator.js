// const express = require('express');
require('dotenv').config();
const checkDirectory = require('./checkdir');
const {readFileSync, readdirSync} = require('fs');
const {createCanvas, loadImage} = require('canvas');
const generator = async (height, width)=>{
    const imageFormat = {
        width,
        height
    }; 
    
    const canvas = createCanvas(imageFormat.width, imageFormat.height);
    const ctx = canvas.getContext('2d');
    const fileDir = {
        traits: `./layers/traits/`,
        outputs:`./layers/outputs/`,
        background:`./layers/background/`,
        combos : './layers/outputs/metadata/allPossibleCases/'
    };

    // let totalOutputs = 0;
    const priorities = ['body','face','bottoms', 'headcover'];
    let layerswapexception = [],
    exception_json = {
        value:null,
        layer_name:null,
        index: null,
        layer_to_swap: null
    }, 
    layer_to_swap = {
        value:null, 
        layer_name:null,
        index: null
    };

    const createOutputDir = ()=>{
        checkDirectory(fileDir.traits);
        checkDirectory(fileDir.outputs);
        checkDirectory(`${fileDir.outputs}metadata`);
        checkDirectory(`${fileDir.outputs}turd`);
        checkDirectory(`${fileDir.background}`);
        checkDirectory(fileDir.combos)
    }

    Array.prototype.swapItems = function(a, b){
        this[a] = this.splice(b, 1, this[a])[0];
        return this;
    }

    const  allPossibleCasez = (arraysToCombine) => {
        exception_json.index = 3;
        exception_json.layer_name = 'headcover';
        exception_json.value = "23.png";
        exception_json.layer_to_swap = 2;
        layerswapexception.push(exception_json); 
        
        exception_json ={};
        exception_json.index = 3;
        exception_json.layer_name = 'headcover';
        exception_json.value = "25.png";
        exception_json.layer_to_swap = 2;
        layerswapexception.push(exception_json);
        
        let temp_pattern, permsCount = 1, i = (arraysToCombine.length - 1);
        while(i >= 0) {
            // divisors[i] = (divisors[i + 1])? divisors[i + 1] * arraysToCombine[i + 1].length :1;
            permsCount *= (arraysToCombine[i].length || 1);
            i--;
        }
        
        let d;
        const  getCombination = (n, arrays) =>  arrays.reduce((previous, current, i) => {
            previous.push(current[Math.floor(Math.random() * current.length)]);
            
            if( (i === (arrays.length-1)) && (layerswapexception.length > 0) ){
                d=0;
                while (d < layerswapexception.length) {
                    // console.log(`prev:11: ${previous[layerswapexception[d].index]}, prev:1: ${layerswapexception[d].layer_to_swap},${layerswapexception[d].value}`);
                    if((layerswapexception[d].layer_name === previous[layerswapexception[d].index].trait_type) && (layerswapexception[d].value === previous[layerswapexception[d].index].value)){
                        // console.log(`prev:22: ${previous[layerswapexception[d].index]}, prev:2: ${layerswapexception[d].layer_to_swap},${layerswapexception[d].value}`);
                        if(typeof(layerswapexception[d].layer_to_swap) == "number"){
                            // console.log(`prev:::: ${previous[layerswapexception[d].index]}, prev::: ${layerswapexception[d].layer_to_swap},${layerswapexception[d].value}`);
                            previous.swapItems(layerswapexception[d].index, layerswapexception[d].layer_to_swap);
                        }
                    }
                    d++;
                }
            }
            
            return  previous;
        }, []);

        let  combinations = [];
        // console.log(`total: ${permsCount}, arraysToCombine: ${arraysToCombine}`)
        let  e = 0, gg, store_combo, dont_push = false;
        while(combinations.length <10001) {
            gg = 0;
            dont_push = false;
            // getCombination(e, arraysToCombine);
            
            store_combo = getCombination(e, arraysToCombine);
            // console.log(`combo: ${JSON.stringify(store_combo)}`);
            while(gg < combinations.length){
                // temp_pattern = ((combinations[gg][0].value) + (combinations[gg][1].value) + (combinations[gg][2].value) + (combinations[gg][3].value));
                // temp_pattern_two = (store_combo[0].value + store_combo[1].value + store_combo[2].value + store_combo[3].value);
                if(((combinations[gg][0].value) + (combinations[gg][1].value) + (combinations[gg][2].value) + (combinations[gg][3].value)) === (store_combo[0].value + store_combo[1].value + store_combo[2].value + store_combo[3].value)) {
                    dont_push = true;
                    // console.log(`index:: ${e}, temp_pattern: ${temp_pattern_two}:: index:: ${e}, ${temp_pattern}`);
                    // break;
                    e++;
                }
                gg++;
            }
            if(dont_push === false){
                // console.log(`pushing index: ${e}`)
                combinations.push(store_combo);
                // console.log(`combo:::: ${JSON.stringify(store_combo)}`);
            }
            // console.log(combinations.length)
            e++;
        }


        console.log(`combo:::: ${combinations[0]}`);
        try {
            checkDirectory(`${fileDir.combos}combos.json`, JSON.stringify(combinations,null,4));
            return  combinations;
        } catch (error) {
            return error;
        }
    };

    const  drawimage = async (traitTypes, background, index) => {
        // draw background
        const  backgroundIm = await  loadImage(`${fileDir.background}${background}`);
        ctx.drawImage(backgroundIm,0,0,imageFormat.width,imageFormat.height);
        //'N/A': means that this punk doesn't have this trait type
        const  drawableTraits = traitTypes.filter(x=>  x.value !== 'N/A')
        // draw all the trait layers for this one punk
        let p = 0;
        while(p < drawableTraits.length) {
            let  val = drawableTraits[p];
            console.log(`drawableTraits: ${JSON.stringify(drawableTraits[p])}`);
            let  image = await  loadImage(`${fileDir.traits}${val.trait_type}/${val.value}`);
            ctx.drawImage(image,0,0,imageFormat.width,imageFormat.height);
            p++;
        }
        
        let metadataJSON = {
            name: `turd ${index}`,

            attributes: drawableTraits
        }
        
        try {
            // save metadata
            return checkDirectory(`${fileDir.outputs}turd/${index}.png`, canvas.toBuffer("image/png"));
            // writeFileSync(`${fileDir.outputs}turd/${index}.png`, canvas.toBuffer("image/png"));
        } catch (error) {
            console.log(error);
        }
    }
    
    const generate = async () => {
        const  traitTypesDir = fileDir.traits;
        const  types = readdirSync(traitTypesDir);
        // set all prioritised layers which will be drawn first. for eg: punk type, hair and then hat. You can set these values in the priorities array in line 21
        // console.log(`traitTypesDir: ${traitTypesDir}`);
        const  traitTypes = priorities.concat(types.filter(x=> !priorities.includes(x)))
        .map(traitType  => (
            readdirSync(`${traitTypesDir}${traitType}/`)
            .map(value=> { 
            return {trait_type: traitType, value: value}
            })
        ));

        let endo=0;

        while (endo < traitTypes.length) {
            
            if (traitTypes[endo][0].trait_type === "face" || traitTypes[endo][0].trait_type === "body") {
                endo++;
            }else{
                traitTypes[endo].push({trait_type: traitTypes[endo][0].trait_type, value: 'N/A'});
                endo++;
            }
        }

        // console.log(`trait types: ${JSON.stringify(traitTypes)}`);
        // register all the backgrounds
        const  backgrounds = readdirSync(fileDir.background);
        // trait type avail for each punk
        const combinations = (checkDirectory('./layers/outputs/metadata/allPossibleCases/combos.json') === true)?JSON.parse(readFileSync('./layers/outputs/metadata/allPossibleCases/combos.json', 'utf8')):allPossibleCasez(traitTypes);
        
        // const  combinations = combinationz();
        let draw_it;
        let n = 0;
        while(n < combinations.length) {
            console.log(`Progress: ${n}/${combinations.length}`);
            const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
            try {

                draw_it = await drawimage(combinations[n] , randomBackground, n);
                // console.log(`index: ${n}\n, combinations length: ${JSON.stringify(combinations[n])}`);
                n++;

            } catch (error) {

                return error
            
            }
        }
    };
    createOutputDir();
    generate();
}

module.exports = generator;