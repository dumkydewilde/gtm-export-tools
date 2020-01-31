<template>
  <v-app>
    <v-app-bar
      app
      color="indigo darken-3"
      dark
    >
      <v-toolbar-title><h1 class="title">GTM Export Tools</h1></v-toolbar-title> 
      <v-spacer></v-spacer>
      <v-file-input label="Select Container File" 
        type="file"
        accept=".json"
        dense
        class="pa-3 mt-6 body-2"
        style="max-width:350px;"
        @change="readContainerFile"
        >
        </v-file-input>
      <v-select v-if="containerLoaded" 
      v-model="selectedFilters"
      multiple
      dense
      outlined
      clearable
      :items="folders"
      item-text="name"
      item-value="folderId"
      key="folderId"
      label="Filter by folder"
      class="pa-4 mt-5 body-2"
      style="max-width:500px;"
      ></v-select>
      <v-btn icon @click="exportContainerToFile('gtm-export.json')" v-if="containerLoaded"><v-icon>save_alt</v-icon></v-btn>
      <v-dialog eager max-width="700" v-model="dialogs.about">
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" ><v-icon>help</v-icon></v-btn>
        </template>
        <v-card>
          <v-card-title>About GTM Export Tools</v-card-title>
          <v-card-text>
            <p>Google Tag Manager (GTM) is a powerful tool. That's exactly why you should limit access to it. GTM Export Tools gives you the power to easily manipulate your GTM container without giving others access to it. Upload your GTM export file and try it yourself!</p>
            <p>A couple of things you might want to try:</p>
            <h4>Open a container</h4>
              <p>Opening your exported GTM container for a visual overview of everything it contains.</p>
            <h4>Organise your folders</h4>
              <p>Organise your tags, triggers and variables in folder by easily creating a new folder and adding your selection to it.</p>
            <h4>Edit names</h4>
              <p>Easily edit the names of your tags, triggers and variables with one simple click. </p >
            <h4>Deselect unused items</h4>
              <p>With the click of a button remove all triggers and variables that are not referenced in any tags or triggers</p>
            <h4>Export selection</h4>
              <p>Select the tags you want for your new container with ease.</p>
            <h4>Set Tag Name for Monitoring</h4>
              <p>GTM allows you to send the tag name when the tag fires so you can monitor your tag usage through a custom template. Instead of going through 150 tags manually, just click a button.</p>
          </v-card-text>
          <v-card-actions class="text-right">
            <v-spacer></v-spacer><v-btn text @click="dialogs.about = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-app-bar>

    <v-content app>
      <v-container fluid v-if="dialogs.alert.active">
        <v-row justify="space-around" v-model="dialogs.alert.active">
          <v-col cols="10">
          <v-alert 
          v-model="dialogs.alert.active"
          info text dismissible
          :type="dialogs.alert.type" 
          border="left"
          >{{dialogs.alert.message}}
          </v-alert>
          </v-col>
        </v-row>
      </v-container>

      <v-container fluid class="fill-height" v-if="!containerLoading && !containerLoaded">
        <v-row justify="space-around" align="center">
          <v-col cols="6" align="center">
            <v-card color="indigo darken-2" dark>
              <v-card-title>Open a GTM container JSON file to get started!</v-card-title>
              <v-card-text>
                <v-file-input label="Select Container File" 
                type="file"
                accept=".json"
                class="pa-3 mr-5"
                @change="readContainerFile"
                >
                </v-file-input>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      
      <v-container fluid class="fill-height" v-if="containerLoading">
        <v-row justify="space-around" align="center">
          <v-col cols="2" align="center">
            <v-progress-circular indeterminate  color="pink" :size="60" :width="6" class="ma-5"></v-progress-circular>
          </v-col>
        </v-row>
      </v-container>


      <v-container fluid v-if="containerLoaded && !containerLoading">
        <v-row justify="space-around">
          <v-col cols="10">
            <v-card outlined>
              <v-card-title>
                {{containerDetails.name}}
              </v-card-title>
              <v-card-subtitle>
                {{containerDetails.publicId}} exported at {{containerDetails.exportTime}}
              </v-card-subtitle>
              <v-card-actions class="d-inline-block">
                <v-menu
                close-on-click
                >
                  <template v-slot:activator="{ on }">
                    <v-btn
                    v-on="on"
                    depressed dense dark color="indigo darken-2"
                    class="ma-2"
                    >
                    Add selection to folder <v-icon right>playlist_add</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item 
                    v-for="folder in folders" 
                    :key="folder.folderId"
                    @click="addToFolder(folder.folderId)"
                    >
                      {{folder.name}}
                    </v-list-item>
                    <v-list-item
                    @click="addToFolder('')"
                    >(none)
                    </v-list-item>
                  </v-list>
                  </v-menu>
                <v-dialog max-width="700" v-model="dialogs.newFolder.active">
                  <template v-slot:activator="{ on }">
                    <v-btn 
                    depressed dense dark color="indigo darken-2"
                    class="mx-2"
                    v-on="on"
                    >
                    Add new folder <v-icon right>create_new_folder</v-icon>
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title>Create new folder</v-card-title>
                    <v-card-text><v-text-field 
                    v-model="dialogs.newFolder.name"
                    placeholder="Name your folder"
                    hint="Make it catchy!"
                    outlined
                    ></v-text-field></v-card-text>
                    <v-card-actions>
                      <v-btn 
                      text 
                      v-if="dialogs.newFolder.name.length > 0"
                      @click="addFolder(dialogs.newFolder.name); (dialogs.newFolder.active=false); (dialogs.newFolder.name='');">
                      Create folder '{{ dialogs.newFolder.name }}'
                      </v-btn>
                      <v-spacer></v-spacer>
                      <v-btn 
                      text 
                      @click="dialogs.newFolder.active=false;">
                      Close
                      </v-btn>
                    </v-card-actions>
                  </v-card>


                </v-dialog>
                

                <v-btn 
                depressed dense dark color="indigo darken-2"
                class="ma-2"
                @click="deselectUnusedItems"
                >Deselect unused items <v-icon right>remove_circle</v-icon>
                </v-btn>


                <v-btn 
                depressed dense dark color="indigo darken-2"
                class="ma-2"
                @click="addNameAsMonitoringKey"
                >Set name as monitoring key <v-icon right>fingerprint</v-icon>
                </v-btn>
              </v-card-actions>

            </v-card>
          </v-col>
          
        </v-row>
        <v-row justify="space-between" align="start">
          <v-col cols="4">
            <h2>Tags
              <v-checkbox 
              class="float-right mt-1" 
              label="Select All" 
              v-model="selectAll.tags"
              color="grey"
              dense
              @change="toggleAll('tags')"
              ></v-checkbox>
              </h2>
            <ContainerItems 
            :items="tags" 
            itemType="tag" 
            :triggerNames="triggerNames" 
            :folders="folders" 
            key="containerTags"
            :selectedFilters="selectedFilters"></ContainerItems>
          </v-col>

          <v-col cols="4">
            <h2>Triggers
              <v-checkbox 
              class="float-right mt-1" 
              label="Select All" 
              v-model="selectAll.triggers"
              color="grey"
              dense
              @change="toggleAll('triggers')"
              ></v-checkbox>
            </h2>
            <ContainerItems 
            :selectedFilters="selectedFilters"
            :items="triggers" 
            itemType="trigger" 
            :folders="folders" 
            key="containerTriggers"></ContainerItems>
          </v-col>

          <v-col cols="4">
            <h2>Variables
              <v-checkbox 
              class="float-right mt-1" 
              label="Select All" 
              v-model="selectAll.variables"
              color="grey"
              dense
              @change="toggleAll('variables')"
              ></v-checkbox>
            </h2>
            <ContainerItems 
            :items="variables" 
            itemType="variable" 
            :folders="folders"
            :selectedFilters="selectedFilters"
            key="containerVariables"></ContainerItems>
          </v-col>

        </v-row>
      </v-container>
    </v-content>
    <v-footer app color="grey lighten-3 ma-0 pa-0">
      <v-col cols="12"
      class="text-center overline"
      >
    GTM Export Tools by <a href="https://www.dumkydewilde.nl" class="black--text">Dumky de Wilde</a>.
      </v-col>
    </v-footer>
  </v-app>
</template>

<script>
//import Vue from 'vue'
import ContainerItems from './components/ContainerItems.vue';
import { track } from '@/main';


export default {
  name: 'GTMExportTools',
  components: {
    //ContainerTrigger,
    ContainerItems,
  },

  data: () => ({
    dialogs: {
      about: false,
      newFolder: {
        active: false,
        name: "",
      },
      alert: {
        active: false,
        message: null,
        type: "info"
      }
    },
    containerLoaded: false,
    containerLoading: false,
    containerDetails: {},
    container: {},
    tags: [],
    variables: [],
    triggers: [],
    folders: [],
    selectedFilters: [],
    lastId: 900,
    selectAll: {
      tags: true,
      triggers: true,
      variables: true,      
    }
  }),

  computed: {
    triggerNames () {
      return this.triggers.reduce((acc, cur) => {
      acc[cur.content.triggerId] = cur.content.name;
      return acc
       }, {}) 
    },
    folderNames () {
      return this.container.containerVersion.folder.reduce((acc, cur) => {
          acc[cur.folderId] = cur.name;
          return acc
      }, {}) || [];
    },
    selectedTags() {
      return this.tags.filter(t => {
        return t.options.selected
      })
    },
    selectedTriggers() {
      return this.triggers.filter(t => {
          return t.options.selected
      })
    },
    selectedVariables() {
      return this.variables.filter(v => {
          return v.options.selected;
      });
    },

  },

  methods: {
    toggleAll: function(itemType) {
      this[itemType].forEach((item) => {
        item.options.selected = this.selectAll[itemType]
      });
      track.logEvent('select_all_' + itemType);
    },

    addFolder(name) {
        this.lastId = this.lastId++;
        let folderDetails = {
                "accountId": this.container.containerVersion.accountId,
                "containerId": this.container.containerVersion.containerId,
                "folderId": this.lastId,
                "name": name,
                "fingerprint": String(Date.now())
            };

        this.folders.push(folderDetails);

        track.logEvent('folder_create_new');

    },

    addToFolder: function(folderId) {
      let selection = [...this.selectedTags, ...this.selectedTriggers, ...this.selectedVariables];
      selection.forEach(el => {
        el.content.parentFolderId = String(folderId);
        el.options.folder.folderId = String(folderId);
      });

      track.logEvent('folder_add_selection');
    },

    addNameAsMonitoringKey: function() {
      this.tags.map(e => {
        e.content.monitoringMetadata = {"type": "MAP"};
        e.content.monitoringMetadataTagNameKey ="name";
        return e
      });
      track.logEvent('set_monitoring_key');
    },

    exportContainerToFile: function(filename) {
        let exportContainer = this.container;
        if (this.selectedTags.length == 0 && this.selectedTriggers.length == 0 && this.selectedVariables.length == 0) {
          this.dialogs.alert = {
            active: true,
            type: "warning",
            message: "Nothing selected for export."
          };

        track.logEvent('container_no_export_selection');

          return null;
        }
        exportContainer.containerVersion.tag = this.selectedTags.map(e => {
          return e.content;
        });
        exportContainer.containerVersion.trigger = this.selectedTriggers.map(e => {
          return e.content;
        });
        exportContainer.containerVersion.variable = this.selectedVariables.map(e => {
          return e.content;
        });
        exportContainer.containerVersion.folder = this.folders;
        var blob = new Blob([JSON.stringify(this.container)], { type: 'text/json' });
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);

        this.dialogs.alert = {
            active: true,
            type: "info",
            message: "Container exported on " + (new Date).toLocaleString("en-GB")
          };

        track.logEvent('container_exported');

    },

    readContainerFile(file) {
      this.containerLoading = true;
      const reader = new FileReader();
      reader.onload = e => {
          let container = "";
          try {
            container = JSON.parse(e.target.result);
          }
          catch {
            this.dialogs.alert = {
              active: true,
              type: "error",
              message: "Unable to parse file."
            };

            track.logEvent('container_parse_error');

            this.containerLoading = false;
            return null;
          }
          
          if (typeof(container.containerVersion) === "undefined") {
            this.dialogs.alert = {
              active: true,
              type: "error",
              message: "This doesn't seem to be a GTM Container file."
            };

            track.logEvent('container_incorrect_file');

            this.containerLoading = false;

            return null;
          }
          this.container = container;
          this.tags = container.containerVersion.tag.map(content => {
            return {
                content: content,
                options: {
                  showDetails: false,
                  selected: true,
                  editing: false,
                  hasDependencies: true,
                  folder: {
                    folderId: content.parentFolderId || '',
                    name: ''
                    } 
                  }
                }
            });
          this.triggers = container.containerVersion.trigger.map(content => {
            return {
                content: content,
                options: {
                  showDetails: false,
                  selected: true,
                  hasDependencies: true,
                  editing: false,
                  folder: {
                    folderId: content.parentFolderId || '',
                    name: ''
                    } 
                  }
                }
            });
          this.variables = container.containerVersion.variable.map(content => {
            return {
                content: content,
                options: {
                  showDetails: false,
                  selected: true,
                  editing: false,
                  hasDependencies: true,
                  folder: {
                    folderId: content.parentFolderId || '',
                    name: ''
                    } 
                  }
                }
            });
          this.folders = container.containerVersion.folder || [];

          this.containerDetails = {
            exportTime: container.exportTime,
            name: container.containerVersion.container.name,
            publicId: container.containerVersion.container.publicId,
          }

          this.containerLoaded = true;
          this.containerLoading = false;

          this.dialogs.alert = {
            active: true,
            type: "info",
            message: "Loaded file: " + file.name
          };

          track.logEvent('container_loaded');
      };
      reader.readAsText(file);
    },

    deselectUnusedItems() {
      let numItems = 0;

      // Triggers used
      let usedTriggers = [...new Set(this.tags.reduce((acc, cur) => {
        const fireTriggers = cur.content.firingTriggerId || [];
        const blockTriggers = cur.content.blockingTriggerId || [];
        acc = [...acc, ...fireTriggers, ...blockTriggers];
        return acc;
      },[]))];


      // Triggers not used
      this.triggers.forEach(e => {
        if (usedTriggers.indexOf(e.content.triggerId) === -1) {
          e.options.selected = false;
          e.options.hasDependencies = false;
          numItems++;
        }
      });

      // Variables not used
      const containerCheckForVariables = JSON.stringify([...this.tags, ...this.triggers, ...this.variables]);
      this.variables.forEach(e => {
        if (containerCheckForVariables.indexOf("{{" + e.content.name + "}}") === -1) {
          e.options.selected = false;
          e.options.hasDependencies = false;
          numItems++;
        }
      })
    
    this.dialogs.alert = {
      active: true,
      type: "info",
      message: numItems + " unused items were deselected."
    };
    track.logEvent('deselect_unused_items');

    }

  },
};
</script>
