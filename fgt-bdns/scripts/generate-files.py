import shutil
import os
import json
import re


"""Write BDNS config specific per company"""


def write_bdns(env, path, valuelist):
    # load templates
    ENV = '$$ENV$$'
    with open('./scripts/helper-files/bdns-start') as starttemplate:
        start = starttemplate.read().replace(ENV, env)

    with open('./scripts/helper-files/bdns-end') as endtemplate:
        end = endtemplate.read().replace(ENV, env)

    with open('./scripts/helper-files/bdns-section') as sectiontemplate:
        section = sectiontemplate.read()

    for valueitem in valuelist:
        filename = "bdns-"+valueitem[0]+".json"
        filecontent = "\n"
        fileout = ""
        for valueitem2 in valuelist:
            if valueitem[0] == valueitem2[0]:
                url = '$ORIGIN'
            else:
                url = valueitem2[1]

            filecontent += section.replace(ENV, env).replace(
                '$$COMPANY$$', valueitem2[0]).replace('$$URL$$', url)
            fileout += section.replace(ENV, env).replace(
                '$$COMPANY$$', valueitem2[0]).replace('$$URL$$', valueitem2[1])

        with open(os.path.join(path, filename), "w") as f:
            f.write(start+filecontent+'\n' +
                    end.replace('$$COMPANY$$', valueitem[0]))
    return(fileout)


"""Create a unique list of keys"""


def prepare_unique(datavalues):
    # extract unique key list
    keys = list(datavalues[0].keys())
    for i in range(len(datavalues)):
        keys += datavalues[i].keys()
    # insert the list to the set
    list_set = set(keys)
    # convert the set to the list
    return (list(list_set))


"""Prepare data before write
 - slices data from list of dictionaries based on unique keys
 - create expected filename (rename key)
 - call write plain config files
 - call BDNS config write
 proceses all keys (files) found in the data
"""


def prepare_config(env, path, datavalues):
    for key in prepare_unique(datavalues):
        templist = []
        if key == "bdns":
            bdnslist = []

        for dictvalue in datavalues:
            if dictvalue.get(key).__class__.__name__ == "tuple":
                for tuplevalue in dictvalue.get(key):
                    # TODO limit those which can have just one value
                    templist.append(str(tuplevalue))
                # Only 1st value is included
                if key == "bdns":
                    bdnslist.append(
                        (str(dictvalue.get("company")), str(dictvalue.get(key)[0])))

            elif dictvalue.get(key) == None:
                continue

            else:
                templist.append(str(dictvalue.get(key)))
                if key == "bdns":
                    bdnslist.append(
                        (str(dictvalue.get("company")), str(dictvalue.get(key))))

        if key == "bdns":
            bdns_content = write_bdns(env, path, bdnslist)

    bdns_val = list()
    for val in bdnslist:
        bdns_val.append(val[1])


"""Gather data from source
Read all data in the dir structure 
"""


def read_files(path):
    read_data = list()
    for root, dirs, files in os.walk(path):
        t_dictionary = dict()
        for file in files:
            with open(os.path.join(root, file), "r") as f:
                t_lines = list()
                for line in f:
                    if len(line.rstrip()) > 0:
                        t_lines.append(line.rstrip())

                if not t_lines:
                    break
                elif len(t_lines) > 1:
                    node_item = tuple(t_lines)
                else:
                    node_item = t_lines[0]

            t_dictionary[file] = node_item

        if t_dictionary:
            # resort company -> first place
            ordered_dict = dict()
            ordered_dict["company"] = os.path.basename(root)
            ordered_dict.update(t_dictionary)
            read_data.append(ordered_dict)

    return read_data


# start script
ROOT_DIR = "./networks"

for it in os.scandir(ROOT_DIR):
    if it.is_dir():
        env = it.name
        # source files
        base_path = os.path.join(ROOT_DIR, env)
        source_path = os.path.join(base_path, "editable")
        dest_path = base_path
        # read data
        output_value = read_files(source_path)
        # generate specific config files
        prepare_config(env, dest_path, output_value)
