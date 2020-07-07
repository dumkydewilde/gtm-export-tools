<template>
    <v-expansion-panels accordion multiple tile>
        <v-expansion-panel 
            v-for="item in filteredItems" 
            :key="itemType + '-' + item.content[idName[itemType]]" 
            v-model="item.options.showDetails" 
            >  
            <v-expansion-panel-header class="my-0 py-0" :color="!item.options.hasDependencies ? 'yellow lighten-5' : ''">
                <v-checkbox
                    v-model="item.options.selected"
                    dense
                    class="mx-0 mt-5"
                    @click.native.stop
                    :color="itemTypeColor[itemType]"
                    style="max-width: 30px;"
                ></v-checkbox>
                <h2 class="subtitle-2 text-left">
                    <span v-if="item.options.editing">
                        <v-icon 
                        class="float-right mt-5"
                        dense 
                        @click.native.stop 
                        @click="item.options.editing = !item.options.editing"
                        >
                        save</v-icon>
                        <v-text-field
                        v-model="item.content.name"
                        @click.native.stop
                        dense
                        class="mt-4"
                        >
                        </v-text-field>
                    </span>
                    <span v-else-if="!item.options.editing">
                        <v-icon 
                        class="float-right"
                        dense 
                        @click.native.stop 
                        @click="item.options.editing = !item.options.editing"
                        >
                        edit</v-icon>
                        {{item.content.name}}
                        <v-spacer></v-spacer>
                        
                    </span>
                    </h2>
                    
            </v-expansion-panel-header>
            <v-expansion-panel-content :color="!item.options.hasDependencies ? 'yellow lighten-5' : ''">

                <div v-if="itemType == 'tag'">
                    <div>
                        <h2 class="overline">Tag Details</h2>
                        <v-list-item dense>
                        <v-list-item-content>
                            <v-list-item-title>
                                <v-chip label text-color="white" small :color="itemTypeColor[itemType]" class="mr-2">
                                    {{item.content.type}}
                                    </v-chip> 
                                <v-chip label text-color="white" small :color="itemTypeColor[itemType]"># {{item.content[itemType + 'Id']}}</v-chip></v-list-item-title>
                        </v-list-item-content>
                        </v-list-item>
                    </div>

                    <div>
                        <h2 class="overline">Tag Parameters</h2>
                        <v-list-item dense three-line v-for="(param, index) in item.content.parameter" :key="'param-'+index">
                        <v-list-item-content>
                            <v-list-item-title>{{param.key}}</v-list-item-title>
                            <v-list-item-subtitle>{{param.value}}</v-list-item-subtitle>
                        </v-list-item-content>
                        </v-list-item>
                    </div>

                    <div v-if="typeof(item.content.monitoringMetadata) !== 'undefined'">
                        <h2 class="overline">Monitoring Key</h2>
                        <v-list-item dense>
                        <v-list-item-content>
                            <v-list-item-title>{{item.content.monitoringMetadataTagNameKey}}</v-list-item-title>
                        </v-list-item-content>
                        </v-list-item>
                    </div>
                    
                    <div>
                        <h2 class="overline mt-5">Firing Triggers</h2>
                        <v-list-item dense v-for="(triggerId, index) in item.content.firingTriggerId" :key="'trigger-'+index">
                        <v-list-item-content>
                            <v-list-item-title>{{triggerNames[triggerId]}}</v-list-item-title>
                        </v-list-item-content>
                        </v-list-item>
                    </div>
                </div>

                 <div v-if="itemType == 'trigger'">
                    <div>
                        <h2 class="overline">Trigger Details</h2>
                        <v-list-item dense>
                        <v-list-item-content>
                            <v-list-item-title>
                                <v-chip label text-color="white" small :color="itemTypeColor[itemType]" class="mr-2">
                                    {{item.content.type}}
                                    </v-chip> 
                                <v-chip label text-color="white" small :color="itemTypeColor[itemType]"># {{item.content[itemType + 'Id']}}</v-chip></v-list-item-title>
                        </v-list-item-content>
                        </v-list-item>
                    </div>
                 </div>

                <div v-if="itemType != 'builtInVariable' && itemType != 'customTemplate'">
                    <h2 class="overline mt-5">Folder</h2>
                    <v-list-item dense>
                    <v-list-item-content>
                        <v-select 
                        v-model="item.options.folder.folderId"
                        :items="folders"
                        item-text="name"
                        item-value="folderId"
                        key="folderId"
                        label="Select a folder"
                        class="mx-0"
                        ></v-select>
                    </v-list-item-content>
                    </v-list-item>
                </div>
            </v-expansion-panel-content>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script>
export default {
    name: "ContainerItems",
    props: {
        items: {
            type: Array,
            required: true
        },
        itemType: {
            type: String,
            required: true
        },
        folders: {
            type: Array,
            required: false
        },
        triggerNames: {
            type: Object,
            required: false
        },
        selectedFilters: {
            type: Array,
            required: true
        }
    },
    data: () => ({
        itemTypeColor: {
            tag: 'indigo',
            trigger: 'yellow darken-2',
            variable: 'pink',
            builtInVariable: 'green darken-2',
            customTemplate: 'brown'
        },
        idName: {
            tag: "tagId",
            trigger: "triggerId",
            variable: "variableId",
            builtInVariable: "name",
            customTemplate: "templateId"
        }
    }),

    computed: {
        filteredItems: function() {
            return this.items.filter(e => {
                if (this.selectedFilters.length > 0) {
                    let folderId = e.options.folder.folderId || null;
                    return this.selectedFilters.indexOf(folderId) > -1
                }
                else {
                    return true
                }
            })
        }
    }

    }
</script>