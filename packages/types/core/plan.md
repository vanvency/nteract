This document attempts to specify the goal for an nteract core package that can
provide generic/core state management to all notebook-y applications. Right now
this is focused on these apps:

* Desktop
* nteract on jupyter
* `@nteract/play`
* notebook on next

This describes a pretty far and wide overhaul of our core logic, including the
notebook itself.

## Core concepts

* `ref` - an internal _reference_ to an entity upon _recognition_, e.g. kernels, hosts, kernelspec collections, etc.
* `id` - likely an external identifier, e.g. with /api/kernels/9092, 9092 is the id

We use the term _recognition_ over _creation_ because we want to have a way to
reference an entity _before_ we get a response from some api. A good example is
having a _ref_ for an active kernel before the kernel has been launched with a
jupyter notebook server. Since there will be a proliferation of id-strings, the
internal ones are called _ref_s and they are only meant for use inside the
application--i.e., they have no meaning externally. The external id-string that
will typically be found is called `id`.

---

Side note -- In flow, this would be typed as:

```js
opaque type Id = string;
opaque type Ref = string;
```

Which can also help us enforce we are using the right ids and refs amongst disparate entities:

```js
opaque type KernelId = Id;
```

---

## Flattened Structure, Database Like Feeling

Stemming from the Redux docs'
[Normalizing State Shape](https://redux.js.org/docs/recipes/reducers/NormalizingStateShape.html),
we setup our application to be collections of entries built in a relational
fashion. We were doing something similar with `cellMap` (map of cell id to cell)
and `cellOrder` (list of cell ids). We're taking it to the next level here.

## The Proposed Structure

```js
{
  // The top level of core state can be considered a notebook, but we formalize
  // that by nesting it under `notebook`.
  notebook: {
      // The ref for the current host
      // On desktop we'll have the one built-in local host that connects to
      // zeromq directly. On jupyterhub backed apps, you'll be able to switch to
      // different hosts.
      selectedHostRef: Ref,
      hostRefs: List<Ref>,
      lastSaved: Date
      
      // TODO: language information? Does this belong at the notebook level?
  },
  
  preferences: {
    lastSaved: Date
  },

  // The piece of state that allows the ui to show loading/error indicators.
  // This is split apart from the entities definitions because the two parts of
  // state serve very different purposes.
  communication: {
    notebook: {
      isSaving: boolean,
      error: ?Object
    },
    preferences: {
      isSaving: boolean,
      error: ?Object
    },
    hostSpec: {
      loading: boolean,
      error: ?Object
    },
    hosts: {
      byRef: {
        [ref: Ref]: {
          ref: Ref,
          loading: boolean,
          error: ?Object
        }
      }
    },
    kernels: {
      byRef: {
        [ref: Ref]: {
          ref: Ref,
          loading: boolean,
          error: ?Object
        }
      }
    },
    kernelSpecs: {
      byRef: {
        [ref: Ref]: {
          ref: Ref,
          loading: boolean,
          error: ?Object
        }
      }
    }
  },

  // These are the actual data that we get back from
  //   * API Calls
  //   * User input
  //   * Kernel output
  entities: {    
    outputs: {
      byRef: {
        [ref: Ref]: {
          ref: Ref,
          data: Object,
          metadata: Object,
          transient: Object,
          type: string // TODO: should be enummed
        }
      },

      // For capturing the display ID mappings
      displayIdToOutputRefs: {
        [id: Id]: List<Ref>
      }
    },

    cells: {
      byRef: {
        [ref: Ref]: {
          type: "code" | "markdown" | "raw",
          ref: Ref,
          source: string,
          metadata: Object,

          // NOTE: the following fields are only on code cells
          outputRefs: List<Ref>,
          executionState: "finished" | "executing" | "queued" | "dirty",
          executionCount: ?number,
          lastExecuteMessage: JupyterMessage
        }
      },
      refs: List<Ref>
    },
    
    hostSpec: {
      // TODO: is this something that's going to be hard-coded into an app? Or,
      // is it something that we'll indeed need to request from some api? See
      // related hostSpec in the `communication` state hunk.
      
      // Else, should this be sorta top-level alongside the `notebook` hunk
      // of state?
    },


    // Each host implementation has a set of kernels which may be activated.
    kernelSpecs: {
      byRef: {
        [ref: Ref]: {
          name: string,
          ref: Ref,
          hostRef: Ref, // TODO: explain why kernelSpecs needs a reference to
                        // its host?
          resources: Object, // TODO: What was this?
          spec: Object, // TODO: Type me!
        }
      }
    },

    hosts: {
      byRef: {
        [ref: Ref]: {
          id: Id,
          ref: Ref,
          type: "local"|"jupyter",
          selectedKernelRef: Ref,
	      kernelRefs: List<Ref>,
          kernelSpecsRef: Ref,
          defaultKernelName: string,
          token: string,
          serverUrl: string,
          crossDomain: boolean,
          messages: List<string> // binder only
        }
      }
      refs: List<Ref>
    },

    // A host may have one active kernel (but we allow multiple to allow smooth
    // transitions between switching kernels).
    kernels: {
      byRef: {
        [ref: Ref]: {
          ref: Ref,
          type: "local" | "jupyter", // same as server, unchanging
          hostRef: Ref,  // TODO: explain why kernelSpecs needs a reference to
                         // its host?
          name: string,
          lastActivity: Date,
          channels: rxjs$Subject,
          status: string,

          id: Id, // jupyter only

          spawn: ChildProcess, // local only
          connectionFile: string, // local only
        }
      }
    },
    notifications: {
      byRef: {
        [ref: Ref]: {
          message: string,
          // TODO: Figure out our structure here
        },
      refs: List<Ref>
      }
    }
  }
}
```
