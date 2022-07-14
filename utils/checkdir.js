const {mkdirSync, writeFileSync, existsSync} = require('fs');
const {sep, join, normalize, resolve, isAbsolute} = require('path');
const checkDirectory = function(dir, data,callback) {
    dir = (isAbsolute(dir))?dir:normalize(resolve(dir));
    let dirsarray = dir.split(sep);
    const file_name = (dirsarray[(dirsarray.length-1)].split('.').length > 1)?dirsarray.pop():null;
    const dir_name = (file_name!=null)?dirsarray.reduce((prev,curr)=>join(prev,curr)):null;
    var thisdir;
    if(existsSync(dir) === true){
        return true
    }

    let i =0, status={code: 'incomplete!', new_folders:[],new_files:[], error:''};
    // console.log(`exists: ${existsSync(dir_name)}, ${dir_name}`);

    if(existsSync(dir_name) === false){
        while(i < dirsarray.length){
            if(i === 0){
                thisdir =  dirsarray[i];
                // console.log(`directory ${i}: ${thisdir}`);
            }else{
                thisdir = join(thisdir,dirsarray[i]);
            }
            try {
                if(!existsSync(thisdir)){
                    mkdirSync(thisdir);
                    // checkDirectory(dir,data,true);
                    status.new_folders.push(thisdir);
                    i++;
                }else{
                    i++;
                }
            } catch (error) {
                status.error = error;
                return (callback)?callback():status;
            }
        }
    }
    
    if(file_name === null || data === undefined){
        status.code = 'completed!';
        return (callback)?callback():status;
    }else{
        // console.log(`ppisssssssssssssssssisisi:: ${JSON.parse(data)[0]}`);
        // data = (data ==null)?'':data;
        let filepath = join(dir_name,file_name);
        try {
            writeFileSync(filepath,data);
            status.new_files.push(filepath);
            status.code = 'completed!';
            return (callback)?callback():status;
        } catch (error) {
            return status.error = error;
        }
    }
    
};

module.exports = checkDirectory;